# BoostBot Starter

> **Note**: This is the simplified starter version of BoostBot. For the full version with advanced features, see the [main repository](../).

## Requirements

**Helipad and Alby Hub are required for this project.**

- Helipad is a simple LND poller and web front-end to see and read boosts and boostagrams.
- BoostBot Starter receives webhooks from Helipad and posts boosts to Nostr.
- You must have Helipad running and configured to send webhooks to BoostBot Starter.
- Get Helipad here: [https://github.com/Podcastindex-org/helipad](https://github.com/Podcastindex-org/helipad)
- **You will also need Alby Hub running on your node.**
  - Alby Hub is available in the app stores of [Umbrel](https://umbrel.com/) and [Start9](https://start9.com/).
  - See the Alby Hub guide: [https://guides.getalby.com/user-guide/alby-hub/alby-hub-flavors/umbrel-start9-etc](https://guides.getalby.com/user-guide/alby-hub/alby-hub-flavors/umbrel-start9-etc)
- **Helipad is most commonly run on:**
  - [Start9](https://start9.com/)
  - [Umbrel](https://umbrel.com/)
  - [RaspiBlitz](https://github.com/raspiblitz/raspiblitz)

**Note:** Currently, BoostBot Starter only posts **sent boosts** to Nostr. Support for received boosts and streams may be added in the future.

**⚠️ Security Disclaimer:** I recommend creating a new set of Nostr keys for this bot so you don't leak your personal ones.

**📱 Compatible Apps:** This only works with apps that use AlbyHub like Podverse, PodcastGuru, CurioCaster, Castamatic, and LNBeats. Find more compatible apps at [https://podcasting2.org/apps](https://podcasting2.org/apps).

A simplified version of BoostBot for new users. This bot receives Helipad webhooks and posts boosts to Nostr without the complex custom features of the full version.

## Features

- ✅ Receives Helipad webhooks
- ✅ Posts boosts to Nostr
- ✅ Simple setup (no TypeScript, no build step)
- ✅ Clear logging with emojis
- ✅ Health checks
- ✅ Easy testing

## What's NOT included (compared to full version)

- ❌ Karma system
- ❌ Custom npub mappings
- ❌ Daily/weekly summaries
- ❌ Complex monitoring
- ❌ Boost session tracking
- ❌ Custom show-specific logic

## Quick Start

### 1. Get a Nostr Key

**You need a Nostr key pair before starting. This is required for the bot to work.**

1.1 Visit https://nostr.com/

1.2 Generate a new key pair

1.3 Copy the `nsec` (private key) - you'll need this for Step 5

1.4 Keep your `npub` (public key) for reference

### 2. Clone the repository

```bash
git clone https://github.com/ChadFarrow/BoostBot-Starter.git
```

### 3. Navigate to the directory

```bash
cd BoostBot-Starter
```

### 4. Copy environment file

```bash
cp env.example .env
```

### 5. Configure Environment

**The `.env` file is hidden by default because its name starts with a dot. Here's how to edit it on different systems:**

#### 5.1 Mac & Linux

5.1.1 Show hidden files in Finder (Mac):
   - Open the folder in Finder.
   - Press `Command + Shift + .` (period) to toggle hidden files.
   - You should now see `.env`. Double-click to open it in your text editor (e.g., TextEdit, VS Code).

5.1.2 Edit from the Terminal:
   - Open Terminal.
   - Use a text editor to open `.env`:
     ```bash
     nano .env
     ```
     or
     ```bash
     open -a "Visual Studio Code" .env
     ```
   - Make your changes, then save and close the editor.

#### 5.2 Windows

5.2.1 Show hidden files in File Explorer:
   - Open the project folder.
   - Click the "View" tab.
   - Check the box for "Hidden items."
   - You should now see `.env`. Right-click and open with Notepad or your preferred editor.

5.2.2 Edit from Command Prompt or PowerShell:
   - Open Command Prompt or PowerShell.
   - Use Notepad to open `.env`:
     ```
     notepad .env
     ```
   - Make your changes, then save and close Notepad.

**Tip:**  
If you don't see the `.env` file after copying, make sure you copied it from `env.example` and that you're in the correct directory.

Edit `.env` file with **only one required setting**:

```bash
# REQUIRED: Your Nostr private key
NOSTR_BOOST_BOT_NSEC=nsec1your_actual_nsec_here
```

That's it! All other settings are optional.

### 6. Install and Run

```bash
# Install dependencies
npm install

# Start the bot
npm start
```

### 7. Test It

In another terminal:
```bash
npm test
```

### 8. Set Up the Webhook in Helipad

To connect Helipad to BoostBot Starter, you need to add a webhook in Helipad so it can send boost events to your bot.

8.1 Open Helipad Settings
- Click the **gear icon** (⚙️) in the top right corner of Helipad.

8.2 Go to the "Webhooks" Tab
- Click the **Webhooks** tab at the top.

8.3 Add a New Webhook
- Click the **Add Webhook** button.

8.4 Fill Out the Webhook Form
- **URL:**  
  Enter the URL where your BoostBot Starter is running.  
  For example:
  ```
  http://<YOUR_SERVER_IP>:3333/helipad-webhook
  ```
  Replace `<YOUR_SERVER_IP>` with your computer's local IP address (see below).

- **Trigger on amount:**  
  Select **Any amount** (or set a minimum if you want).

- **Trigger on:**  
  Check the boxes for:
  - New boosts
  - New streams
  - New sent boosts

- **Enabled:**  
  Make sure this is checked.

8.5 Save the Webhook
- Click **Save changes**.

8.6 Test the Connection
- Send a boost from a compatible app and check your BoostBot Starter logs to confirm it's working.

---

8.7 How to Find Your Local IP Address

- **Mac:**
  8.7.1 Open Terminal and run:
     ```bash
     ipconfig getifaddr en0
     ```
     (or try `en1` if you're on Wi-Fi and `en0` doesn't work)
  8.7.2 The output is your local IP address (e.g., `192.168.1.42`).

- **Windows:**
  8.7.1 Open Command Prompt and run:
     ```
     ipconfig
     ```
  8.7.2 Look for the `IPv4 Address` under your active network adapter.

- **Linux:**
  8.7.1 Open Terminal and run:
     ```bash
     hostname -I
     ```
  8.7.2 The first address is usually your local IP.

Use this IP in the webhook URL field in Helipad.

## API Endpoints

- `GET /` - Status page
- `GET /health` - Health check
- `GET /status` - Bot status
- `POST /helipad-webhook` - Webhook endpoint

## Webhook Format

The bot expects Helipad webhook events in this format:

```json
{
  "index": 123,
  "time": 1234567890,
  "value_msat": 1000000,
  "value_msat_total": 1000000,
  "action": 2,
  "sender": "user123",
  "app": "helipad",
  "message": "Great episode!",
  "podcast": "My Podcast",
  "episode": "Episode 1",
  "tlv": "..."
}
```

## Nostr Posting

The bot will post to Nostr when:
- `action` is `2` (Boost)
- `value_msat_total` is greater than 0

Posts include:
- Amount in sats
- Sender name (if available)
- Podcast name (if available)
- Message (if provided)
- Standard hashtags

**Example post:**
```
🎙️ Boosted "My Awesome Podcast" with 1000 sats
From: @alice
Message: "Great episode! Love the insights on Bitcoin."
#Podcast2 #Value4Value #Lightning #Nostr
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NOSTR_BOOST_BOT_NSEC` | **Yes** | Your Nostr private key (nsec format) |
| `TEST_MODE` | No | Set to 'true' for test mode |
| `PORT` | No | Server port (default: 3333) |
| `LOG_LEVEL` | No | Log level (ERROR, WARN, INFO, DEBUG) |

## Troubleshooting

### Bot not posting to Nostr
- Check `NOSTR_BOOST_BOT_NSEC` is set correctly
- Verify the nsec format is valid
- Check logs for errors

### Webhook not working
- Verify the webhook URL is correct
- Ensure the webhook payload format is correct

### Bot won't start
- Make sure Node.js 18+ is installed
- Check that port 3333 is available
- Verify your `.env` file exists

## Development

```bash
# Install dependencies
npm install

# Start the bot
npm start

# Test the webhook
npm test
```

## File Structure

```
boostbot-starter/
├── 📄 README.md              # This documentation
├── 📄 env.example            # Environment template
├── 📄 package.json           # Dependencies
├── 📄 .gitignore             # Git ignore rules
├── 🧪 test-webhook.js        # Test script
├── 🤖 helipad-webhook.js     # Main webhook handler
└── 📁 lib/                   # Library files
    ├── 📄 logger.js          # Simple logging
    └── 📄 nostr-bot.js       # Nostr posting logic
```

## License

MIT License 