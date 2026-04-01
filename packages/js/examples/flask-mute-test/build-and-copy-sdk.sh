#!/bin/bash

# Build and Copy SDK Script
# This script builds the SignalWire SDK and copies it to the Flask app

set -e

echo "🔨 Building SignalWire SDK with mute fix..."

# Navigate to the project root
cd ../../../..

# Build the JavaScript SDK
echo "📦 Running npm run setup js..."
npm run setup js

# Build development version (less minified)
echo "📦 Building development version..."
cd packages/js
NODE_ENV=development npx webpack --mode development
cd ../..

# Copy the built SDK to the Flask app
echo "📋 Copying built SDK to Flask app..."
cp packages/js/dist/index.min.js packages/js/examples/flask-mute-test/static/signalwire.js

echo "✅ SDK built and copied successfully!"
echo "🎯 The Flask app will now use the local SDK with your mute fix."
echo ""
echo "💡 To test your changes:"
echo "   1. Run this script after making SDK changes"
echo "   2. Restart the Flask app (python app.py)"
echo "   3. Refresh the browser to load the new SDK" 