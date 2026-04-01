#!/bin/bash

# SignalWire Audio Mute Fix Test - Flask Edition
# Quick start script

set -e

echo "🎤 SignalWire Audio Mute Fix Test - Flask Edition"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.7+ and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    echo "Please install pip3 and try again."
    exit 1
fi

# Check environment variables
if [ -z "$SIGNALWIRE_SPACE" ] || [ -z "$SIGNALWIRE_PROJECT_ID" ] || [ -z "$SIGNALWIRE_TOKEN" ]; then
    echo "❌ Missing required environment variables:"
    echo ""
    echo "Please set the following environment variables:"
    echo "export SIGNALWIRE_SPACE=\"your-space.signalwire.com\""
    echo "export SIGNALWIRE_PROJECT_ID=\"your-project-id-here\""
    echo "export SIGNALWIRE_TOKEN=\"your-api-token-here\""
    echo ""
    echo "Or create a .env file with these values."
    exit 1
fi

# Install dependencies if requirements.txt exists and is newer than last install
if [ -f "requirements.txt" ]; then
    if [ ! -f ".last_install" ] || [ "requirements.txt" -nt ".last_install" ]; then
        echo "📦 Installing Python dependencies..."
        pip3 install -r requirements.txt
        touch .last_install
    else
        echo "✅ Dependencies already installed"
    fi
fi

echo ""
echo "🚀 Starting Flask application..."
echo "Space: $SIGNALWIRE_SPACE"
echo "Project ID: $SIGNALWIRE_PROJECT_ID"
echo ""
echo "🌐 Open your browser to: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Run the Flask app
python3 app.py 