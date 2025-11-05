#!/usr/bin/env python3
"""
SignalWire Audio Mute Fix Test Server

This Flask application provides:
1. JWT token generation for SignalWire Browser SDK
2. A test interface for verifying the audio mute state preservation fix
3. Automatic configuration using environment variables

Usage:
    export SIGNALWIRE_SPACE="your-space.signalwire.com"
    export SIGNALWIRE_PROJECT_ID="your-project-id"
    export SIGNALWIRE_TOKEN="your-api-token"
    python app.py
"""

import os
import time
import uuid
import hmac
import hashlib
import base64
import json
import requests
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration from environment variables
SIGNALWIRE_SPACE = os.getenv('SIGNALWIRE_SPACE')
SIGNALWIRE_PROJECT_ID = os.getenv('SIGNALWIRE_PROJECT_ID') 
SIGNALWIRE_TOKEN = os.getenv('SIGNALWIRE_TOKEN')

if not all([SIGNALWIRE_SPACE, SIGNALWIRE_PROJECT_ID, SIGNALWIRE_TOKEN]):
    print("Error: Missing required environment variables:")
    print("- SIGNALWIRE_SPACE")
    print("- SIGNALWIRE_PROJECT_ID") 
    print("- SIGNALWIRE_TOKEN")
    exit(1)

def generate_jwt_token():
    """
    Generate a JWT token for SignalWire Browser SDK using the REST API
    Based on: https://developer.signalwire.com/sdks/browser-sdk/v2/
    """
    
    # Use SignalWire REST API to generate JWT token
    url = f"https://{SIGNALWIRE_SPACE}/api/relay/rest/jwt"
    
    # Set up authentication
    auth = (SIGNALWIRE_PROJECT_ID, SIGNALWIRE_TOKEN)
    
    # Request payload
    payload = {
        "resource": f"browser-{uuid.uuid4()}",  # Unique resource identifier
        "expires_in": 60  # Token expires in 60 minutes
    }
    
    # Make the request
    response = requests.post(
        url,
        json=payload,
        auth=auth,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        data = response.json()
        return data.get('jwt_token')
    else:
        raise Exception(f"Failed to generate JWT token: {response.status_code} - {response.text}")

@app.route('/')
def index():
    """Serve the main test interface"""
    return render_template('index.html', 
                         space=SIGNALWIRE_SPACE,
                         project_id=SIGNALWIRE_PROJECT_ID)

@app.route('/api/token', methods=['GET'])
def get_token():
    """Generate and return a new JWT token"""
    try:
        token = generate_jwt_token()
        return jsonify({
            'success': True,
            'token': token,
            'expires_in': 3600  # 60 minutes in seconds
        })
    except Exception as e:
        print(f"Error generating JWT token: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    """Return configuration for the frontend"""
    return jsonify({
        'space': SIGNALWIRE_SPACE,
        'project_id': SIGNALWIRE_PROJECT_ID
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'space': SIGNALWIRE_SPACE,
        'project_configured': bool(SIGNALWIRE_PROJECT_ID)
    })

if __name__ == '__main__':
    print(f"Starting SignalWire Mute Fix Test Server...")
    print(f"Space: {SIGNALWIRE_SPACE}")
    print(f"Project ID: {SIGNALWIRE_PROJECT_ID}")
    print(f"Server will be available at: http://localhost:3000")
    print(f"Test interface at: http://localhost:3000")
    
    app.run(debug=True, host='0.0.0.0', port=3000) 