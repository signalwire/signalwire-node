#!/usr/bin/env python3
"""
Test script to verify JWT generation works correctly
"""

import os
import sys
import requests
import uuid

# Configuration from environment variables
SIGNALWIRE_SPACE = os.getenv('SIGNALWIRE_SPACE')
SIGNALWIRE_PROJECT_ID = os.getenv('SIGNALWIRE_PROJECT_ID') 
SIGNALWIRE_TOKEN = os.getenv('SIGNALWIRE_TOKEN')

def test_jwt_generation():
    """Test JWT token generation using SignalWire REST API"""
    
    print(f"Testing JWT generation...")
    print(f"Space: {SIGNALWIRE_SPACE}")
    print(f"Project ID: {SIGNALWIRE_PROJECT_ID}")
    print(f"Token: {SIGNALWIRE_TOKEN[:10]}...")
    
    # Use SignalWire REST API to generate JWT token
    url = f"https://{SIGNALWIRE_SPACE}/api/relay/rest/jwt"
    
    # Set up authentication
    auth = (SIGNALWIRE_PROJECT_ID, SIGNALWIRE_TOKEN)
    
    # Request payload
    payload = {
        "resource": f"browser-{uuid.uuid4()}",  # Unique resource identifier
        "expires_in": 60  # Token expires in 60 minutes
    }
    
    print(f"Making request to: {url}")
    print(f"Payload: {payload}")
    
    # Make the request
    try:
        response = requests.post(
            url,
            json=payload,
            auth=auth,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response text: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            jwt_token = data.get('jwt_token')
            print(f"✅ JWT token generated successfully!")
            print(f"Token: {jwt_token[:50]}...")
            return jwt_token
        else:
            print(f"❌ Failed to generate JWT token: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Exception during JWT generation: {str(e)}")
        return None

if __name__ == '__main__':
    if not all([SIGNALWIRE_SPACE, SIGNALWIRE_PROJECT_ID, SIGNALWIRE_TOKEN]):
        print("❌ Missing required environment variables:")
        print("- SIGNALWIRE_SPACE")
        print("- SIGNALWIRE_PROJECT_ID") 
        print("- SIGNALWIRE_TOKEN")
        sys.exit(1)
    
    test_jwt_generation() 