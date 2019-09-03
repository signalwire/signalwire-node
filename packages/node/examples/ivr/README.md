# nodejs SignalWire Client Example

Run

```
npm install
node .
```


# Agora Demo


```
-------Signalwire-------|----------User Side-------------------------
PSTN                    |
  |                     |
  |                     | (SDK/websocket)
Signalwire Platform <---------------------> Agora Demo Server
  |                     |                    |
  |                     |                    |(websocket)
  +-- SIP Phone         |                    +---- Agora SDK (Mobile Client)
```

* Signalwire Platform with Relay API
* Agora Demo Server is a demo that must be implemented on the User Side
* Agora SDK connect to Agora Demo Server via websocket or whatever
* Agora Demo Server using Signalwire SDK to connect to Signalwire Platform with (`project_id`, `token`})

