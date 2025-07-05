#!/bin/bash

# BoostBot Starter - Docker Setup Script
# This script sets up everything inside Docker without installing anything on your machine

echo "🚀 Setting up BoostBot Starter in Docker..."

# Create a temporary directory for the setup
mkdir -p /tmp/boostbot-setup
cd /tmp/boostbot-setup

# Clone the repository (replace with your actual repo URL)
echo "📥 Cloning repository..."
git clone https://github.com/yourusername/BoostBot.git

# Navigate to the starter directory
cd BoostBot/boostbot-starter

# Copy environment file
echo "⚙️ Setting up environment..."
cp env.example .env

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit the .env file with your Nostr key:"
echo "   nano .env"
echo ""
echo "2. Build and run the bot:"
echo "   docker build -t boostbot-starter ."
echo "   docker run -p 3333:3333 --env-file .env boostbot-starter"
echo ""
echo "3. Or use docker-compose:"
echo "   docker-compose up --build"
echo ""
echo "The bot will be available at http://localhost:3333" 