# SignalWire Restart ICE Demo

This demo allows you to test the ICE restart functionality when making calls to other browsers, SIP Endpoints or Phone Numbers from your SignalWire project in your browser.

Visit [Relay SDK for JavaScript Documentation](https://docs.signalwire.com/topics/relay-sdk-js) for more information and documentation.

## To Get Started

### Prerequisites

1. A SignalWire account with a Space, Project ID, and API Token
2. A web server (since the demo requires HTTP/HTTPS to work properly with localStorage and CORS)

### Running the Demo

1. **Navigate to the example directory:**
   ```sh
   cd packages/js/examples/restart-ice
   ```

2. **Start a local web server:**

   **Option 1: Using Python (if installed)**
   
   On Linux/Mac:
   ```sh
   python3 -m http.server 8080 --bind localhost
   ```
   
   On Windows:
   ```sh
   python -m http.server 8080 --bind localhost
   ```
   
   > **Note:** If `--bind localhost` doesn't work on your Python version, try: `python -m http.server 8080 --bind 127.0.0.1`

   **Option 2: Using Node.js (http-server)**
   ```sh
   npx http-server -p 8080 -a localhost
   ```

   **Option 3: Using PHP (if installed)**
   ```sh
   php -S localhost:8080
   ```

3. **Open the demo in your browser:**
   
   Use one of these addresses:
   ```
   http://localhost:8080
   ```
   or
   ```
   http://127.0.0.1:8080
   ```
   
   > **Troubleshooting:** If you see `ERR_ADDRESS_INVALID` or the browser tries to access `http://[::]:8080/`, it means the server is listening on IPv6. Make sure you:
   > 1. Use `--bind localhost` or `--bind 127.0.0.1` with Python
   > 2. Use `-a localhost` with http-server
   > 3. Access the page using `http://localhost:8080` or `http://127.0.0.1:8080` (not IPv6 addresses)

4. **Configure your SignalWire credentials:**
   - Fill in your SignalWire Space name (e.g., `yourexample` or `yourexample.signalwire.com`)
   - Enter your Project ID
   - Enter your API Token (starts with `PT...`)
   - Optionally set the Resource identifier (default: `test-client`)
   - Optionally set the Expires In time in seconds (default: 3600)

5. **Configure Relay Host (optional):**
   - If you're using a custom domain or development environment, you can specify the Relay host
   - Leave empty for default production host

6. **Generate or enter a JWT token:**
   - Click "Generate Token" to create a JWT automatically (may fail due to CORS restrictions)
   - If token generation fails, generate a JWT separately using curl or the SignalWire API and paste it manually:
     ```sh
     curl -X POST "https://YOUR_SPACE.signalwire.com/api/relay/rest/jwt" \
       -H "Content-Type: application/json" \
       -u "YOUR_PROJECT_ID:YOUR_API_TOKEN" \
       -d '{"expires_in": 3600, "resource": "test-client"}'
     ```

7. **Connect:**
   - Click "Connect" to establish connection with SignalWire Relay

8. **Make a call:**
   - Fill in the destination number or resource
   - Optionally set the caller number
   - Select audio/video options
   - Click "Call" to start a call

9. **Test ICE Restart:**
   - Once a call is active, click "Restart ICE" to test the ICE restart functionality
   - This is useful for recovering from network connectivity issues

## Features

- **Call Management:** Make outbound calls with audio and/or video
- **ICE Restart:** Test ICE restart functionality during active calls
- **DTMF Support:** Send DTMF tones during calls
- **Logging:** View important events and errors in the logging panel
- **Custom Domains:** Support for custom SignalWire domains and development environments

## Troubleshooting

### Token Generation Errors

If you see `ERR_CERT_COMMON_NAME_INVALID` or CORS errors when generating tokens:

**For custom domains (e.g., `dev.swire.io`):**
- The certificate error may occur if the domain uses a self-signed certificate or has certificate issues
- The code will automatically detect custom domains and use the correct API URL
- **Solution:** Use curl to generate the token manually:
  ```sh
  curl -X POST "https://dev.swire.io/api/relay/rest/jwt" \
    -H "Content-Type: application/json" \
    -u "YOUR_PROJECT_ID:YOUR_API_TOKEN" \
    -d '{"expires_in": 3600, "resource": "test-client"}'
  ```
  Then copy the `jwt_token` from the response and paste it into the Token field

**For standard SignalWire domains:**
- If you see CORS errors, use curl to generate the token:
  ```sh
  curl -X POST "https://YOUR_SPACE.signalwire.com/api/relay/rest/jwt" \
    -H "Content-Type: application/json" \
    -u "YOUR_PROJECT_ID:YOUR_API_TOKEN" \
    -d '{"expires_in": 3600, "resource": "test-client"}'
  ```

### Authentication Errors

If you see `Authentication service failed with status 401 Unauthorized`:

**Important for custom domains:**
- If you're using a custom domain (e.g., `dev.swire.io`), you **must** also configure the "Relay Host" field
- Enter the Relay host in the format: `relay.dev.swire.io` (or the appropriate Relay host for your environment)
- Without the correct Relay Host, the connection will fail with 401 errors

**General troubleshooting:**
- Verify your Project ID and API Token are correct
- Ensure your JWT token hasn't expired
- Check that the token was generated with the correct resource identifier
- Make sure you're using the correct Space name
- For custom domains, ensure both the Space and Relay Host are configured correctly

### Custom Domains

For custom domains or development environments (e.g., `dev.swire.io`):

1. **Enter the full domain in the Space field:** `dev.swire.io` (without `https://` or trailing slashes)
2. **Configure the Relay Host:** This is **required** for custom domains. Enter the Relay host (e.g., `relay.dev.swire.io`) in the "Relay Host" field
3. **The code automatically detects:** Domains that don't end with `.signalwire.com` are treated as custom domains
4. **Generate token manually:** Due to certificate issues, you may need to generate the JWT token using curl (see Token Generation Errors above)

> **Note:** For custom domains, both the Space field and Relay Host field must be configured correctly, otherwise you'll get 401 authentication errors.

### localStorage Issues

If you notice JavaScript errors relating to `localStorage`:

- Try unblocking 3rd Party Cookies in your browser settings
- Some browsers mark localStorage as 3rd Party when running from `file://` protocol
- Always use a local web server (not `file://`) to avoid these issues

### Network Issues

If calls fail or have connectivity problems:

- Check the browser console for detailed error messages
- Review the logging panel for important events
- Ensure your firewall allows WebRTC traffic
- Try using the "Restart ICE" button to recover from network issues

