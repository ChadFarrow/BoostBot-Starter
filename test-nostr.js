// test-nostr.js
// Test posting a simple message to Nostr using the bot's private key

require('dotenv').config();
const { relayInit, getEventHash, signEvent, validateEvent, verifySignature } = require('nostr-tools');

const RELAY_URL = 'wss://relay.damus.io'; // You can change this to any public relay
const NSEC = process.env.NOSTR_BOOST_BOT_NSEC;

if (!NSEC) {
  console.error('❌ NOSTR_BOOST_BOT_NSEC is not set in your .env file.');
  process.exit(1);
}

const { getPublicKey, nip19 } = require('nostr-tools');
const privateKey = nip19.decode(NSEC).data;
const pubkey = getPublicKey(privateKey);

async function testNostrPost() {
  const relay = relayInit(RELAY_URL);
  relay.on('connect', () => {
    console.log(`✅ Connected to relay: ${RELAY_URL}`);
  });
  relay.on('error', () => {
    console.error(`❌ Failed to connect to relay: ${RELAY_URL}`);
  });
  await relay.connect();

  const event = {
    kind: 1,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: '🚀 Test post from BoostBot Starter (test-nostr.js)',
  };
  event.id = getEventHash(event);
  event.sig = signEvent(event, privateKey);

  if (!validateEvent(event) || !verifySignature(event)) {
    console.error('❌ Invalid event or signature.');
    process.exit(1);
  }

  try {
    let pub = relay.publish(event);
    pub.on('ok', () => {
      console.log('✅ Successfully posted test event to Nostr!');
      relay.close();
      process.exit(0);
    });
    pub.on('failed', reason => {
      console.error('❌ Failed to post event:', reason);
      relay.close();
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Error posting to Nostr:', err.message);
    relay.close();
    process.exit(1);
  }
}

testNostrPost(); 