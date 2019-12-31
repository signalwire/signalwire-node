import { Controllable } from './Controllable'
import { Notification, FaxState } from '../constants'
import Event from '../Event'

export abstract class BaseFax extends Controllable {
  public eventType: string = Notification.Fax
  public controlId: string = this.controlId

  public direction: string
  public identity: string
  public remoteIdentity: string
  public document: string
  public pages: number

  notificationHandler(params: any): void {
    const { fax: { type, params: faxParams } } = params
    this.state = type

    this.completed = this.state !== FaxState.Page
    if (this.completed) {
      if (faxParams.success) {
        this.successful = true
        this.direction = faxParams.direction
        this.identity = faxParams.identity
        this.remoteIdentity = faxParams.remote_identity
        this.document = faxParams.document
        this.pages = faxParams.pages
      }
      this.event = new Event(this.state, faxParams)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
