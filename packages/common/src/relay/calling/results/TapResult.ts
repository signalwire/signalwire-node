import BaseResult from './BaseResult'
import Tap from '../components/Tap'
import { ICallingTapTap, ICallingTapDevice } from '../../../util/interfaces'

export default class TapResult extends BaseResult {
  constructor(public component: Tap) {
    super(component)
  }

  get tap(): ICallingTapTap {
    return this.component.tap
  }

  get sourceDevice(): ICallingTapDevice {
    return this.component.sourceDevice
  }

  get destinationDevice(): ICallingTapDevice {
    return this.component.device
  }
}
