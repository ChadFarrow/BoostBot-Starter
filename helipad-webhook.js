// BoostBot Starter - Simple Helipad to Nostr Webhook Bot
// This is the main file that receives webhooks from Helipad and posts boosts to Nostr

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { announceHelipadPayment } = require('./lib/nostr-bot.js');
const { logger } = require('./lib/logger.js');
const crypto = require('crypto');

// Create Express app
const app = express();

// Parse JSON requests (Helipad sends JSON webhooks)
app.use(bodyParser.json());

// Serve static files (like the status page)
app.use(express.static('public'));

// Get authentication token from environment (optional)
const AUTH_TOKEN = process.env.HELIPAD_WEBHOOK_TOKEN;

// Session grouping logic for boost splits
const boostSessions = {};
const postedBoosts = new Set();
const BOOST_SESSION_TIMEOUT = 30000; // 30 seconds

function getMessageHash(message) {
  return crypto.createHash('sha256').update(message || '').digest('hex').slice(0, 12);
}

function getSessionId(event) {
  // Compose session ID from action, sender, episode, podcast, and message hash
  return [
    event.action,
    event.sender,
    event.episode,
    event.podcast,
    getMessageHash(event.message)
  ].join('-');
}

// Middleware to check authentication (if token is set)
function authenticate(req, res, next) {
  // If no token is set, skip authentication
  if (!AUTH_TOKEN) {
    return next();
  }

  // Check if request has proper authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('❌ Missing or invalid Authorization header');
    return res.status(401).json({ error: 'Unauthorized - missing Bearer token' });
  }

  // Extract token from header (remove 'Bearer ' prefix)
  const token = authHeader.substring(7);
  if (token !== AUTH_TOKEN) {
    logger.warn('❌ Invalid authentication token');
    return res.status(401).json({ error: 'Unauthorized - invalid token' });
  }

  // Authentication passed
  next();
}

// Health check endpoint - useful for monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'BoostBot Starter is running!'
  });
});

// Main webhook endpoint - this is where Helipad sends boost data
app.post('/helipad-webhook', authenticate, async (req, res) => {
  try {
    const event = req.body;
    logger.info('📥 Received Helipad webhook:', {
      action: event.action,
      sender: event.sender,
      podcast: event.podcast,
      episode: event.episode,
      amount: Math.floor(event.value_msat_total / 1000),
      message: event.message
    });

    const sessionId = getSessionId(event);
    if (!boostSessions[sessionId]) {
      boostSessions[sessionId] = {
        largest: event,
        timer: null
      };
    }
    // If this split is larger, keep it
    const currentLargest = boostSessions[sessionId].largest;
    if ((event.value_msat_total || event.value_msat || 0) > (currentLargest.value_msat_total || currentLargest.value_msat || 0)) {
      boostSessions[sessionId].largest = event;
    }
    // Reset session timer
    if (boostSessions[sessionId].timer) {
      clearTimeout(boostSessions[sessionId].timer);
    }
    boostSessions[sessionId].timer = setTimeout(async () => {
      const toPost = boostSessions[sessionId].largest;
      if (!postedBoosts.has(sessionId) && toPost.action === 2 && (toPost.value_msat_total || toPost.value_msat) > 0) {
        try {
          logger.info(`💰 (Session) Posting largest split: ${Math.floor((toPost.value_msat_total || toPost.value_msat) / 1000)} sats from ${toPost.sender || 'Unknown'} → ${toPost.podcast || 'Unknown'}`);
          await announceHelipadPayment(toPost);
          postedBoosts.add(sessionId);
        } catch (nostrError) {
          logger.error('❌ Error posting to Nostr:', nostrError.message);
        }
      } else {
        logger.info('ℹ️  Skipping Nostr post (already posted, not a boost, or zero amount)');
      }
      delete boostSessions[sessionId];
    }, BOOST_SESSION_TIMEOUT);

    res.json({ success: true, message: 'Boost split received and session updated.', sessionId });
  } catch (error) {
    logger.error('❌ Error processing webhook:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    message: 'BoostBot Starter is ready to receive webhooks!'
  });
});

// Root endpoint - shows basic info
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>BoostBot Starter</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
            .ok { background-color: #d4edda; color: #155724; }
            .info { background-color: #d1ecf1; color: #0c5460; }
        </style>
    </head>
    <body>
        <h1>🚀 BoostBot Starter</h1>
        <div class="status ok">✅ Bot is running and ready!</div>
        <div class="status info">
            <strong>Webhook URL:</strong> POST /helipad-webhook<br>
            <strong>Health Check:</strong> GET /health<br>
            <strong>Status:</strong> GET /status
        </div>
        <p>This bot receives Helipad webhooks and posts boosts to Nostr.</p>
        <p><strong>Next step:</strong> Configure Helipad to send webhooks to this URL.</p>
    </body>
    </html>
  `);
});

// Get port from environment or use default
const PORT = process.env.PORT || 3333;

// Start the server
app.listen(PORT, () => {
  logger.info(`🚀 BoostBot Starter running on port ${PORT}`);
  logger.info(`📡 Webhook endpoint: http://localhost:${PORT}/helipad-webhook`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
  logger.info(`📊 Status page: http://localhost:${PORT}/status`);
  
  // Check if Nostr key is configured
  if (!process.env.NOSTR_BOOST_BOT_NSEC) {
    logger.warn('⚠️  NOSTR_BOOST_BOT_NSEC not set - Nostr posting will be disabled');
  } else {
    logger.info('✅ Nostr key configured - ready to post boosts!');
  }
}); 