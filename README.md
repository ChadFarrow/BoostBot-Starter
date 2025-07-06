# 🚀 BoostBot-Starter

**Automatically share your Podcasting 2.0 support on Nostr**

> **Note**: This is the simplified starter version of BoostBot. For the full version with advanced features, see the [main repository](../).

## 🤔 What is BoostBot-Starter?

BoostBot-Starter automatically shares your Podcasting 2.0 Boost to Nostr whenever you send Boosts to podcasters or musicians.

**Example:** You boost "My Awesome Podcast" with 1000 sats → BoostBot posts:
```
🎙️ Boosted "My Awesome Podcast" with 1000 sats
From: @alice
Message: "Great episode! Love the insights on Bitcoin."
#Podcast2 #Value4Value #Lightning #Nostr
```

### 🎯 Perfect for:
- Podcast listeners who boost shows with Bitcoin
- Nostr users wanting to share their podcast discovery
- Supporting the Value4Value podcasting movement

## 🏗️ How It Works

```
Your Podcast App → Lightning Payment → Helipad → BoostBot-Starter → Nostr Post
       📱               ⚡           🚁           🤖            📱
```

1. **You boost a podcast** in a compatible app (like Podverse, CurioCaster)
2. **Helipad captures it** on your Lightning node
3. **BoostBot-Starter receives a webhook** from Helipad
4. **Your boost gets posted** to your Nostr feed



## 📋 Prerequisites

### Required Infrastructure:
- **🏠 Lightning Node** - [Umbrel](https://umbrel.com/), [Start9](https://start9.com/), or [RaspiBlitz](https://github.com/raspiblitz/raspiblitz)
- **⚡ Alby Hub** - Available in your node's app store ([setup guide](https://guides.getalby.com/user-guide/alby-hub/alby-hub-flavors/umbrel-start9-etc))
- **🚁 Helipad** - Monitors Lightning payments ([get it here](https://github.com/Podcastindex-org/helipad))

### What You Need:
- **📱 Compatible podcast app** - [Podverse](https://podverse.fm/), [PodcastGuru](https://podcastguru.io/), [CurioCaster](https://curiocaster.com/), [Castamatic](https://castamatic.com/), [LNBeats](https://lnbeats.com/) ([full list](https://podcasting2.org/apps))
- **🔑 Nostr account** - We'll help you create one below
- **💻 Basic terminal skills** - Copy/paste commands

> **⚠️ Security Note:** Create a NEW Nostr key pair for this bot - don't use your personal keys!

> **🔍 Current Limitation:** Only **sent boosts** are posted to Nostr (not received boosts or streams)

## 🚀 Quick Setup

### Step 1: Get Your Nostr Keys

**🔑 You need Nostr keys for the bot to post. This takes 2 minutes:**

1. Visit **[nostr.com](https://nostr.com/)**
2. Click **"Generate Keys"**
3. **Save both keys somewhere safe:**
   - `nsec1...` (private key) ← You'll need this for Step 5
   - `npub1...` (public key) ← Your bot's Nostr identity
4. **Optional:** Follow your bot's `npub` from your main Nostr account

### Step 2: Download & Install

```bash
# Clone the repository
git clone https://github.com/ChadFarrow/BoostBot-Starter.git

# Navigate to directory
cd BoostBot-Starter

# Install dependencies
npm install
```

### Step 3: Configure Your Bot

```bash
# Copy the example environment file
cp env.example .env
```

**Edit the `.env` file:**

<details>
<summary>📁 How to edit .env file (click to expand)</summary>

The `.env` file is hidden by default. Here's how to edit it:

**🍎 Mac:**
- **Finder:** Press `Cmd + Shift + .` to show hidden files, then double-click `.env`
- **Terminal:** `open -a "TextEdit" .env` or `nano .env`

**🪟 Windows:**  
- **File Explorer:** View tab → Check "Hidden items", then right-click `.env` → Open with Notepad
- **Command Prompt:** `notepad .env`

**🐧 Linux:**
- **Terminal:** `nano .env` or `gedit .env`

</details>

**Add your Nostr key (this is the only required setting):**

```bash
# REQUIRED: Your Nostr private key from Step 1
NOSTR_BOOST_BOT_NSEC=nsec1your_actual_private_key_here

# Optional settings (defaults work fine):
# PORT=3333
# LOG_LEVEL=INFO
# TEST_MODE=false
```

### Step 4: Test Your Setup

```bash
# Start the bot
npm start
```

**In a new terminal, test it:**
```bash
# Send a test post to Nostr
npm test
```

**✅ Success looks like:**
- Terminal shows: `✅ Test boost posted to Nostr successfully!`
- You see the test post in your Nostr client

**❌ If it fails:**
- Check your `NOSTR_BOOST_BOT_NSEC` is correct
- Verify the `nsec` format (starts with `nsec1`)

### Step 5: Connect Helipad

**🚁 Tell Helipad to send webhook notifications to your bot:**

1. **Open Helipad** in your browser
2. **Click the gear icon** ⚙️ (top-right corner)
3. **Go to "Webhooks" tab**
4. **Click "Add Webhook"**
5. **Fill out the form:**

   ```
   URL: http://YOUR_LOCAL_IP:3333/helipad-webhook
   Trigger on amount: Any amount
   Trigger on: ✅ New boosts, ✅ New streams, ✅ New sent boosts  
   Enabled: ✅ Checked
   ```

6. **Find YOUR_LOCAL_IP:**

<details>
<summary>🌐 How to find your local IP address (click to expand)</summary>

**🍎 Mac:** `ipconfig getifaddr en0`  
**🪟 Windows:** `ipconfig` (look for IPv4 Address)  
**🐧 Linux:** `hostname -I`

Example: If your IP is `192.168.1.42`, use:
```
http://192.168.1.42:3333/helipad-webhook
```

</details>

7. **Click "Save changes"**

### Step 6: Test the Full Flow

1. **Send a boost** from your podcast app (even 1 sat works)
2. **Check your bot logs** for: `📩 Received boost webhook...`
3. **Check Nostr** for your boost post!

**🎉 You're done!** Your boosts will now automatically appear on Nostr.





## 🩺 Troubleshooting

### 🚫 "Bot not posting to Nostr"

**Check your Nostr key:**
```bash
# Your .env should look like this:
NOSTR_BOOST_BOT_NSEC=nsec1abc123...very_long_string...xyz789
```

**Common issues:**
- ❌ Missing `nsec1` prefix
- ❌ Key has spaces or line breaks
- ❌ Using `npub` instead of `nsec`

### 🚫 "Webhook not working"

1. **Verify BoostBot-Starter is running:**
   ```bash
   curl http://localhost:3333/health
   # Should return: {"status":"ok"}
   ```

2. **Check Helipad webhook URL:**
   - Make sure it's `http://YOUR_IP:3333/helipad-webhook`
   - Use your actual local IP address
   - Port 3333 should be open

3. **Test with curl:**
   ```bash
   curl -X POST http://localhost:3333/helipad-webhook \
     -H "Content-Type: application/json" \
     -d '{"action":2,"value_msat_total":1000,"podcast":"Test"}'
   ```

### 🚫 "I sent a boost but nothing happened"

**Check the boost conditions:**
- Must be a **sent boost** (not received)
- Must have `value_msat_total > 0`
- Must have `action: 2` (boost action)

**Check your logs:**
```bash
# Look for these messages:
📩 Received boost webhook...
✅ Posted boost to Nostr successfully
```

### 🚫 "Can't find .env file"

The `.env` file is hidden by default:
- Make sure you ran `cp env.example .env`
- Enable hidden file visibility (see Step 3 above)
- Check you're in the `BoostBot-Starter` directory

### 📋 Viewing Logs

**If running locally:**
```bash
npm start
# Logs appear directly in terminal
```



## 🔬 Webhook Format

**BoostBot-Starter expects this JSON from Helipad:**

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

**Posts to Nostr when:**
- `action` is `2` (Boost)
- `value_msat_total` > 0

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Test the webhook endpoint
npm test

# Check code style (if you add linting)
npm run lint
```

## 📁 Project Structure

```
boostbot-starter/
├── 📄 README.md              # This guide
├── 📄 env.example            # Environment template  
├── 📄 package.json           # Dependencies & scripts
├── 📄 .gitignore             # Git ignore rules
├── 🧪 test-webhook.js        # Test script
├── 🤖 helipad-webhook.js     # Main webhook handler
└── 📁 lib/                   # Core logic
    ├── 📄 logger.js          # Emoji logging
    └── 📄 nostr-bot.js       # Nostr posting
```

## 🤝 Support

- **🐛 Found a bug?** [Open an issue](https://github.com/ChadFarrow/BoostBot-Starter/issues)
- **❓ Need help?** Check the troubleshooting section above
- **💬 Community:** Find us on Nostr or in Value4Value spaces
- **👨‍💻 Creator:** Follow [@ChadFarrow on Nostr](https://primal.net/npub177fz5zkm87jdmf0we2nz7mm7uc2e7l64uzqrv6rvdrsg8qkrg7yqx0aaq7) - `npub177fz5zkm87jdmf0we2nz7mm7uc2e7l64uzqrv6rvdrsg8qkrg7yqx0aaq7`

## 📄 License

MIT License - Feel free to modify and distribute!

---

**🎉 Happy boosting!** Share those sats and spread the word about great podcasts.
