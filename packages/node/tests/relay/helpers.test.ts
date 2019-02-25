import { detectCallType, reduceConnectParams } from '../../src/relay/helpers'
import { ICallDevice } from '../../../common/src/util/interfaces'

describe('detectCallType()', () => {
  it('detect phone call type', () => {
    expect(detectCallType('(204) 222-9999')).toEqual('phone')
    expect(detectCallType('+1 (204) 222-9999')).toEqual('phone')
    expect(detectCallType('1 (204) 222-9999')).toEqual('phone')
  })

  it('detect SIP call type', () => {
    expect(detectCallType('sip:joe.smith@127.0.0.1')).toEqual('sip')
    expect(detectCallType('sip:test@sip.example.com')).toEqual('sip')
    expect(detectCallType('sip:22444032@sip.example.com:6000')).toEqual('sip')
  })

  it('detect WebRTC call type', () => {
    expect(detectCallType('1008')).toEqual('webrtc')
    expect(detectCallType('1009-conf-admin')).toEqual('webrtc')
  })
})

describe('reduceConnectParams()', () => {
  const from_number = '8992222222'
  const from_number_cleaned = '+18992222222'
  const to_number = '8991111111'
  const to_number_cleaned = '+18991111111'
  const timeout = 30
  const type = 'phone'
  const DEFAULT_DEVICE: ICallDevice = { type, params: { from_number, timeout, to_number: '' } }
  it('should return a single device to call', () => {
    const res = [
      [{ type, params: { to_number: to_number_cleaned, from_number: from_number_cleaned, timeout } }]
    ]
    const input = [to_number]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return a single device to call specifying from and timeout', () => {
    const res = [
      [{ type, params: { to_number: to_number_cleaned, from_number: from_number_cleaned, timeout: 50 } }]
    ]
    const input = [{ to: to_number, from: from_number, timeout: 50 }]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in serial', () => {
    const res = [
      [{ type, params: { to_number: to_number_cleaned, from_number: from_number_cleaned, timeout } }],
      [{ type, params: { to_number: '+18991111112', from_number: from_number_cleaned, timeout } }]
    ]
    const input = [to_number, '8991111112']
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in serial specifying from and timeout', () => {
    const res = [
      [{ type, params: { to_number: to_number_cleaned, from_number: from_number_cleaned, timeout: 10 } }],
      [{ type, params: { to_number: '+18991111112', from_number: '+18992222223', timeout: 20 } }]
    ]
    const input = [
      { to: to_number, from: from_number, timeout: 10 },
      { to: '8991111112', from: '8992222223', timeout: 20 }
    ]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in parallel', () => {
    const res = [[
      { type, params: { to_number: to_number_cleaned, from_number: from_number_cleaned, timeout } },
      { type, params: { to_number: '+18991111112', from_number: from_number_cleaned, timeout } }
    ]]
    const input = [
      [to_number, '8991111112']
    ]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in parallel specifying from and timeout', () => {
    const res = [[
      { type, params: { to_number: to_number_cleaned, from_number: from_number_cleaned, timeout } },
      { type, params: { to_number: '+18991111119', from_number: '+18992222229', timeout: 20 } }
    ]]
    const input = [
      [
        { to: to_number, from: from_number, timeout },
        { to: '18991111119', from: '8992222229', timeout: 20 }
      ]
    ]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in both serial & parallel', () => {
    const res = [
      [{ type, params: { to_number: to_number_cleaned, from_number: from_number_cleaned, timeout } }],
      [
        { type, params: { to_number: to_number_cleaned, from_number: from_number_cleaned, timeout } },
        { type, params: { to_number: '+18991111112', from_number: from_number_cleaned, timeout } }
      ],
      [{ type, params: { to_number: '+18991111113', from_number: from_number_cleaned, timeout } }]
    ]
    const input = [
      to_number,
      [to_number, '8991111112'],
      '8991111113'
    ]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in both serial & parallel specifying from and timeout', () => {
    const res = [
      [{ type, params: { to_number: to_number_cleaned, from_number: from_number_cleaned, timeout } }],
      [
        { type, params: { to_number: to_number_cleaned, from_number: '+18992222223', timeout: 25 } },
        { type, params: { to_number: '+18991111112', from_number: '+18992222224', timeout: 25 } }
      ],
      [{ type, params: { to_number: '+18991111113', from_number: '+18992222225', timeout } }]
    ]
    const input = [
      { to: to_number, from: from_number, timeout },
      [
        { to: to_number, from: '8992222223', timeout: 25 },
        { to: '8991111112', from: '8992222224', timeout: 25 }
      ],
      { to: '8991111113', from: '8992222225', timeout }
    ]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  describe('with invalid parameters', () => {
    it('should not reduce invalid strings', () => {
      expect(reduceConnectParams([''], DEFAULT_DEVICE)).toEqual([])
      expect(reduceConnectParams([], DEFAULT_DEVICE)).toEqual([])
    })

    it('should ignore invalid string to call in serial', () => {
      const res = [
        [{ type, params: { to_number: '+18991111112', from_number: from_number_cleaned, timeout } }]
      ]
      expect(reduceConnectParams(['', '8991111112'], DEFAULT_DEVICE)).toEqual(res)
    })

    it('should ignore invalid input in both serial & parallel specifying from and timeout', () => {
      const res = [
        [
          { type, params: { to_number: to_number_cleaned, from_number: from_number_cleaned, timeout } }
        ],
        [
          { type, params: { to_number: '+18991111112', from_number: '+18992222226', timeout: 25 } }
        ]
      ]
      const input = [
        { to: to_number, from: from_number, timeout },
        [
          { from: '7778', timeout: 25 },
          { to: '', from: '7772', timeout: 25 },
          { to: '8991111112', from: '8992222226', timeout: 25 }
        ],
        { to: '', from: '7780', timeout }
      ]
      expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
    })
  })
})
