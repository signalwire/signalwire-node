import { BaseAction } from './BaseAction'
import { Tap } from '../components/Tap'
import { TapResult } from '../results/TapResult'
import { ICallingTapDevice } from '../../../util/interfaces'

export class TapAction extends BaseAction {

  constructor(public component: Tap) {
    super(component)
  }

  get result(): TapResult {
    return new TapResult(this.component)
  }

  get sourceDevice(): ICallingTapDevice {
    return this.component.sourceDevice
  }

  stop() {
    return this.component.stop()
  }
}
