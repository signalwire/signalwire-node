# SignalWire Audio Mute Fix Test - Flask Edition

This Flask application provides an automated testing environment for verifying the audio mute state preservation fix in the SignalWire JavaScript SDK. It automatically generates JWT tokens and provides a comprehensive test interface.

## 🎯 What This Tests

This application tests the fix for a critical issue where:
- **Problem**: When a call was muted using `call.muteAudio()`, switching audio input devices with `call.setAudioInDevice()` would create a new audio track that was unmuted, losing the mute state.
- **Fix**: The SDK now preserves the `enabled` state from the old audio track when creating a new track during device switching.

## 🚀 Quick Start

### Prerequisites

1. **Python 3.7+** installed
2. **SignalWire Account** with:
   - Space (e.g., `your-space.signalwire.com`)
   - Project ID
   - API Token
3. **Multiple Audio Devices** (built-in mic + USB headset, etc.) for testing

### Setup

1. **Clone and navigate to the example**:
   ```bash
   cd packages/js/examples/flask-mute-test
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables**:
   ```bash
   export SIGNALWIRE_SPACE="your-space.signalwire.com"
   export SIGNALWIRE_PROJECT_ID="your-project-id-here"
   export SIGNALWIRE_TOKEN="your-api-token-here"
   ```

   Or create a `.env` file:
   ```bash
   SIGNALWIRE_SPACE=your-space.signalwire.com
   SIGNALWIRE_PROJECT_ID=your-project-id-here
   SIGNALWIRE_TOKEN=your-api-token-here
   ```

4. **Build and copy the SDK** (to use the local version with the mute fix):
   ```bash
   ./build-and-copy-sdk.sh
   ```

5. **Run the Flask application**:
   ```bash
   python app.py
   ```

6. **Open your browser**:
   - Navigate to `http://localhost:3000`
   - The JWT token will be automatically generated and displayed

## 🧪 Running the Test

### Automated Test

1. **Connect**: Click "Connect to SignalWire" - JWT is auto-generated
2. **Make a Call**: Enter destination/source numbers and click "Start Call"
3. **Wait for Active**: Once call is active, the test button will be enabled
4. **Run Test**: Click "🧪 Run Mute Fix Test" to execute the automated test sequence

### Manual Test

You can also manually test using the controls that appear when a call is active:
- **Mute/Unmute Audio**: Toggle audio mute state
- **Device Selection**: Switch between available audio input devices
- **Real-time Feedback**: Watch the console log and button states

## 📋 Test Sequence

The automated test performs these steps:

1. **Initial State Check**: Verifies audio starts unmuted
2. **Mute Audio**: Calls `muteAudio()` and verifies mute state
3. **🎯 Device Switch While Muted**: Switches audio device and verifies mute state is preserved (THE FIX)
4. **Unmute Audio**: Calls `unmuteAudio()` and verifies unmute state
5. **Device Switch While Unmuted**: Switches audio device and verifies unmute state is preserved

### Expected Results

✅ **All tests should pass if the fix is working**:
- ✅ Initial State: Audio starts unmuted
- ✅ Mute Audio: Audio becomes muted
- ✅ **Mute Preserved After Device Switch**: Audio remains muted (this was the bug!)
- ✅ Unmute Audio: Audio becomes unmuted
- ✅ Unmute Preserved After Device Switch: Audio remains unmuted

❌ **If the fix is broken, you'll see**:
- ❌ Mute Preserved After Device Switch: Audio becomes unmuted (the bug returns)

## 🔧 API Endpoints

The Flask app provides these endpoints:

- `GET /` - Main test interface
- `GET /api/token` - Generate JWT token
- `GET /api/config` - Get SignalWire configuration
- `GET /health` - Health check

## 📁 Project Structure

```
flask-mute-test/
├── app.py                 # Flask application with JWT generation
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Test interface with automated testing
└── README.md             # This file
```

## 🔍 Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Ensure all three environment variables are set correctly
   - Double-check your SignalWire credentials

2. **"Need at least 2 audio devices to run test"**
   - Connect a USB headset or external microphone
   - The test requires multiple audio input devices to switch between

3. **JWT Token Generation Fails**
   - Verify your API token has the correct permissions
   - Check that your project ID is correct

4. **Call Fails to Connect**
   - Ensure destination number is valid and reachable
   - Check your SignalWire project has calling enabled
   - Verify browser permissions for microphone access

### Debug Information

- **Console Log**: Real-time logging appears in the web interface
- **Browser Console**: Additional debug information in browser dev tools
- **Flask Logs**: Server-side logs in the terminal running the Flask app

### Health Check

Visit `http://localhost:3000/health` to verify:
- Flask app is running
- Environment variables are loaded
- SignalWire configuration is valid

## 🧬 Technical Details

### JWT Token Generation

The Flask app generates JWT tokens according to the [SignalWire Browser SDK v2 documentation](https://developer.signalwire.com/sdks/browser-sdk/v2/):

```python
payload = {
    "iss": SIGNALWIRE_PROJECT_ID,      # Issuer (your project)
    "sub": f"user-{uuid.uuid4()}",     # Subject (unique user)
    "iat": int(now.timestamp()),       # Issued at
    "exp": int((now + timedelta(hours=1)).timestamp()),  # Expires in 1 hour
    "jti": str(uuid.uuid4()),          # JWT ID (unique token)
    "resource": "browser",             # Resource type
    "scopes": ["webrtc"]              # Required scopes
}
```

### The Fix Implementation

The fix is in `packages/common/src/webrtc/BaseCall.ts`:

```typescript
async setAudioInDevice(deviceId: string): Promise<void> {
  // ... get new stream and track ...
  
  // 🎯 THE FIX: Preserve enabled state from old track
  const { localStream } = this.options
  const oldAudioTracks = localStream.getAudioTracks()
  if (oldAudioTracks.length > 0) {
    audioTrack.enabled = oldAudioTracks[0].enabled  // Preserve mute state!
  }
  
  // ... replace track and update stream ...
}
```

## 🤝 Contributing

To test changes to the SDK:

1. **Make your changes** to the SDK source code in `packages/common/src/`

2. **Build and copy the SDK**:
   ```bash
   ./build-and-copy-sdk.sh
   ```

3. **Restart the Flask app** to serve the new SDK:
   ```bash
   python app.py
   ```

4. **Refresh your browser** to load the updated SDK and **run the test** to verify your changes work

### Development Workflow

The Flask app is already configured to use the local SDK build. The workflow is:

1. Edit SDK source code
2. Run `./build-and-copy-sdk.sh` 
3. Restart Flask app
4. Test in browser

This ensures you're always testing against your local changes rather than the CDN version.

## 📄 License

This example is part of the SignalWire Node.js SDK and follows the same MIT license. 