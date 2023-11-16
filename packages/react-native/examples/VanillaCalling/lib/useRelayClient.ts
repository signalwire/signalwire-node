import {ISignalWireOptions, Relay} from '@signalwire/react-native';
import {useEffect, useState} from 'react';

export default function useRelayClient(
  options: ISignalWireOptions,
  onRinging: (call: any) => void,
) {
  const [client, setClient] = useState<null | Relay>(null);
  const [connected, setConnected] = useState(false);
  const [call, setCall] = useState(null);

  useEffect(() => {
    if (options.token === undefined || options.project === undefined) return;
    let _client: Relay | undefined;
    async function createClient() {
      _client = new Relay(options);

      _client.on('signalwire.ready', () => {
        setConnected(true);
      });

      _client.on('signalwire.error', (e: any) => {
        console.error(e);
      });

      _client.on('signalwire.notification', (notification: any) => {
        switch (notification.type) {
          case 'callUpdate':
            onCallUpdate(notification.call);
        }
      });

      _client.iceServers = [{urls: ['stun:stun.l.google.com:19302']}];

      _client.on('signalwire.socket.open', () => {
        console.log('Socket Open');
      });
      _client.on('signalwire.socket.close', (e: any) => {
        console.log('Socket Close', e);
      });
      _client.on('signalwire.socket.error', () => {
        console.log('Socket Error');
      });

      await _client?.connect();
      setClient(_client);

      // disconnect on unmount
      return () => {
        _client?.disconnect();
      };
    }

    async function onCallUpdate(call: any) {
      switch (call.state) {
        case 'ringing': {
          onRinging(call);
          break;
        }
        case 'active':
          setCall(call);
          break;
        case 'destroy':
          setCall(null);
          break;
      }
    }
    createClient();
  }, [options.token]);

  return {client, connected, call};
}
