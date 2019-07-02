import { v4 as uuidv4 } from 'uuid'
import { Execute } from '../../../messages/Blade'
import Call from '../Call'
import Blocker from '../Blocker'

export default abstract class BaseComponent {

  /** Type of Relay events to handle. state|play|collect|record|connect */
  public abstract eventType: string

  /** ControlId to identify the component among the notifications */
  public abstract controlId: string = uuidv4()

  /** Blocker to wait some evens */
  public blocker: Blocker

  /** Current component state */
  public state: string

  /** Whether the component has complete the execution */
  public completed: boolean = false

  /** Whether the component has finished successfully */
  public successful: boolean = false

  /** The final result of the component */
  public result: any

  /** Relay response of the first execute. (200/400/500) */
  protected _executeResult: any

  /** Array of events to wait to resolve the Blocker */
  protected _eventsToWait: string[] = []

  constructor(public call: Call) {
  }

  /** Relay method to execute */
  abstract get method(): string

  /** Payload sent to Relay in requests */
  abstract get payload(): any

  /** Execute message and return the Relay response */
  async execute(): Promise<any> {
    const msg = new Execute({
      protocol: this.call.relayInstance.protocol,
      method: this.method,
      params: this.payload
    })

    this._executeResult = await this.call._execute(msg)

    return this._executeResult
  }

  /**
   * Handle Relay notification to update the component
   *
   * @param params Relay notification params
   */
  abstract notificationHandler(params: any): void

  _waitFor(...events: string[]): Promise<any> {
    this._eventsToWait = events
    this.blocker = new Blocker(this.eventType, this.controlId)

    this.execute()

    return this.blocker.promise
  }

  protected _hasBlocker(): boolean {
    return this._eventsToWait.length && this.blocker instanceof Blocker
  }
}
