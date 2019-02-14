import { detectCallType, reduceConnectParams } from '../../src/relay/helpers'
import { ICallDevice } from '../../../common/src/util/interfaces'

describe('detectCallType()', () => {
  it('detect phone call type', () => {
    expect(detectCallType('1234')).toEqual('phone')
  })

  it('detect sip call type', () => {
    // TODO: to be implemented
    expect(detectCallType('1234@domain.it')).toEqual('phone')
  })

  it('detect webrtc call type', () => {
    // TODO: to be implemented
    expect(detectCallType('1234')).toEqual('phone')
  })
})

describe('reduceConnectParams()', () => {
  const DEFAULT_DEVICE: ICallDevice = { type: 'phone', params: { from_number: '2224449999', timeout: 30, to_number: '' } }
  // const DEFAULT_TIMEOUT = 30
  // const DEFAULT_FROM_NUMBER = '2224449999'
  const DEFAULT_FROM_NUMBER_CLEANED = '+12224449999'
  it('should return a single device to call', () => {
    const res = [[{ type: 'phone', params: { to_number: '+1234', from_number: DEFAULT_FROM_NUMBER_CLEANED, timeout: 30 } }]]
    expect(reduceConnectParams(['1234'], DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return a single device to call specifying from and timeout', () => {
    const res = [[{ type: 'phone', params: { to_number: '+1234', from_number: '+18888', timeout: 50 } }]]
    expect(reduceConnectParams([{ to_number: '1234', from_number: '8888', timeout: 50 }], DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in serial', () => {
    const res = [
      [{ type: 'phone', params: { to_number: '+1234', from_number: DEFAULT_FROM_NUMBER_CLEANED, timeout: 30 } }],
      [{ type: 'phone', params: { to_number: '+14567', from_number: DEFAULT_FROM_NUMBER_CLEANED, timeout: 30 } }]
    ]
    expect(reduceConnectParams(['1234', '4567'], DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in serial specifying from and timeout', () => {
    const res = [
      [{ type: 'phone', params: { to_number: '+19999', from_number: '+17777', timeout: 10 } }],
      [{ type: 'phone', params: { to_number: '+19998', from_number: '+17778', timeout: 20 } }]
    ]
    const input = [
      { to_number: '9999', from_number: '7777', timeout: 10 }, { to_number: '9998', from_number: '7778', timeout: 20 }
    ]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in parallel', () => {
    const res = [[
      { type: 'phone', params: { to_number: '+1234', from_number: DEFAULT_FROM_NUMBER_CLEANED, timeout: 30 } },
      { type: 'phone', params: { to_number: '+14567', from_number: DEFAULT_FROM_NUMBER_CLEANED, timeout: 30 } }
    ]]
    expect(reduceConnectParams([['1234', '4567']], DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in parallel specifying from and timeout', () => {
    const res = [[
      { type: 'phone', params: { to_number: '+1234', from_number: '+17777', timeout: 30 } },
      { type: 'phone', params: { to_number: '+1235', from_number: '+17778', timeout: 20 } }
    ]]
    const input = [
      [{ to_number: '1234', from_number: '7777', timeout: 30 }, { to_number: '1235', from_number: '7778', timeout: 20 }]
    ]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in both serial & parallel', () => {
    const res = [
      [{ type: 'phone', params: { to_number: '+19999', from_number: DEFAULT_FROM_NUMBER_CLEANED, timeout: 30 } }],
      [
        { type: 'phone', params: { to_number: '+1234', from_number: DEFAULT_FROM_NUMBER_CLEANED, timeout: 30 } },
        { type: 'phone', params: { to_number: '+14567', from_number: DEFAULT_FROM_NUMBER_CLEANED, timeout: 30 } }
      ],
      [{ type: 'phone', params: { to_number: '+198877', from_number: DEFAULT_FROM_NUMBER_CLEANED, timeout: 30 } }]
    ]
    expect(reduceConnectParams(['19999', ['1234', '4567'], '98877'], DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in both serial & parallel specifying from and timeout', () => {
    const res = [
      [{ type: 'phone', params: { to_number: '+19999', from_number: '+17777', timeout: 30 } }],
      [
        { type: 'phone', params: { to_number: '+1234', from_number: '+17778', timeout: 25 } },
        { type: 'phone', params: { to_number: '+14567', from_number: '+17779', timeout: 25 } }
      ],
      [{ type: 'phone', params: { to_number: '+198877', from_number: '+17780', timeout: 30 } }]
    ]
    const input = [
      { to_number: '19999', from_number: '7777', timeout: 30 },
      [
        { to_number: '1234', from_number: '7778', timeout: 25 },
        { to_number: '4567', from_number: '7779', timeout: 25 }
      ],
      { to_number: '98877', from_number: '7780', timeout: 30 }
    ]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })
})
