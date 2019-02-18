import BrowserSession from './BrowserSession'

export default class SignalWire extends BrowserSession {
  protected async _onDisconnect() {
    // TODO: sent unsubscribe for all subscriptions?
  }
}
