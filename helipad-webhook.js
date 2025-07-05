// BoostBot Starter - Simple Helipad to Nostr Webhook Bot
// This is the main file that receives webhooks from Helipad and posts boosts to Nostr

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { announceHelipadPayment } = require('./lib/nostr-bot.js');
const { logger } = require('./lib/logger.js');

// Create Express app
const app = express();

// Parse JSON requests (Helipad sends JSON webhooks)
app.use(bodyParser.json());

// Serve static files (like the status page)
app.use(express.static('public'));

// Get authentication token from environment (optional)
const AUTH_TOKEN = process.env.HELIPAD_WEBHOOK_TOKEN;

// Debounce and aggregate logic to avoid duplicate Nostr posts for the same boost
const pendingBoosts = {};
const BOOST_DEBOUNCE_MS = 2000; // 2 seconds

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
      amount: Math.floor(event.value_msat_total / 1000)
    });

    // Composite key: time-sender-podcast
    const boostKey = `${event.time}-${event.sender}-${event.podcast}`;
    if (!pendingBoosts[boostKey]) {
      pendingBoosts[boostKey] = {
        events: [],
        timer: null
      };
    }
    // Add this split to the list
    pendingBoosts[boostKey].events.push(event);

    // Reset debounce timer
    if (pendingBoosts[boostKey].timer) {
      clearTimeout(pendingBoosts[boostKey].timer);
    }
    pendingBoosts[boostKey].timer = setTimeout(async () => {
      // Aggregate all splits for this boost
      const allEvents = pendingBoosts[boostKey].events;
      // Sum the amounts
      const totalMsat = allEvents.reduce((sum, e) => sum + (e.value_msat_total || e.value_msat || 0), 0);
      // Use the first event as the base
      const baseEvent = { ...allEvents[0] };
      baseEvent.value_msat_total = totalMsat;
      baseEvent.value_msat = totalMsat;
      logger.info(`💰 (Aggregated) Posting boost: ${Math.floor(totalMsat / 1000)} sats from ${baseEvent.sender || 'Unknown'} → ${baseEvent.podcast || 'Unknown'}`);
      if (baseEvent.action === 2 && totalMsat > 0) {
        try {
          await announceHelipadPayment(baseEvent);
        } catch (nostrError) {
          logger.error('❌ Error posting to Nostr:', nostrError.message);
        }
      } else {
        logger.info('ℹ️  Skipping Nostr post (not a boost or zero amount)');
      }
      delete pendingBoosts[boostKey];
    }, BOOST_DEBOUNCE_MS);

    res.json({ success: true, message: 'Boost received and will be posted after aggregation/debounce.', key: boostKey });
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