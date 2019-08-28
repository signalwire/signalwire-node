import { reduceConnectParams, prepareRecordParams } from '../../src/relay/helpers'
import { ICallDevice } from '../../src/util/interfaces'

describe('reduceConnectParams()', () => {
  const from_number = '+18992222222'
  const to_number = '+18991111111'
  const timeout = 30
  const type = 'phone'
  const DEFAULT_DEVICE: ICallDevice = { type, params: { from_number, timeout, to_number: '' } }

  it('should return a single device to call', () => {
    const res = [
      [{ type, params: { to_number, from_number, timeout } }]
    ]
    const input = [{ type, to: to_number }]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return a single device to call specifying from and timeout', () => {
    const res = [
      [{ type, params: { to_number, from_number, timeout: 50 } }]
    ]
    const input = [{ type, to: to_number, from: from_number, timeout: 50 }]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in serial', () => {
    const res = [
      [{ type, params: { to_number, from_number, timeout } }],
      [{ type, params: { to_number: '8991111112', from_number, timeout } }]
    ]
    const input = [{ type, to: to_number }, { type, to: '8991111112' }]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in serial specifying from and timeout', () => {
    const res = [
      [{ type, params: { to_number, from_number, timeout: 10 } }],
      [{ type, params: { to_number: '8991111112', from_number: '8992222223', timeout: 20 } }]
    ]
    const input = [
      { type, to: to_number, from: from_number, timeout: 10 },
      { type, to: '8991111112', from: '8992222223', timeout: 20 }
    ]
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in parallel', () => {
    const res = [[
      { type, params: { to_number, from_number, timeout } },
      { type, params: { to_number: '8991111112', from_number, timeout } }
    ]]
    const input = [
      [{ type, to: to_number }, { type, to: '8991111112' }]
    ]
    // @ts-ignore
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in parallel specifying from and timeout', () => {
    const res = [[
      { type, params: { to_number, from_number, timeout } },
      { type, params: { to_number: '8991111119', from_number: '8992222229', timeout: 20 } }
    ]]
    const input = [
      [
        { type, to: to_number, from: from_number, timeout },
        { type, to: '8991111119', from: '8992222229', timeout: 20 }
      ]
    ]
    // @ts-ignore
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in both serial & parallel', () => {
    const res = [
      [{ type, params: { to_number, from_number, timeout } }],
      [
        { type, params: { to_number, from_number, timeout } },
        { type, params: { to_number: '8991111112', from_number, timeout } }
      ],
      [{ type, params: { to_number: '8991111113', from_number, timeout } }]
    ]
    const input = [
      { type, to: to_number },
      [{ type, to: to_number }, { type, to: '8991111112' }],
      { type, to: '8991111113' }
    ]
    // @ts-ignore
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  it('should return multiple devices to call in both serial & parallel specifying from and timeout', () => {
    const res = [
      [{ type, params: { to_number, from_number, timeout } }],
      [
        { type, params: { to_number, from_number: '8992222223', timeout: 25 } },
        { type, params: { to_number: '8991111112', from_number: '8992222224', timeout: 25 } }
      ],
      [{ type, params: { to_number: '8991111113', from_number: '8992222225', timeout } }]
    ]
    const input = [
      { type, to: to_number, from: from_number, timeout },
      [
        { type, to: to_number, from: '8992222223', timeout: 25 },
        { type, to: '8991111112', from: '8992222224', timeout: 25 }
      ],
      { type, to: '8991111113', from: '8992222225', timeout }
    ]
    // @ts-ignore
    expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
  })

  describe('with invalid parameters', () => {
    it('should not reduce invalid strings', () => {
      // @ts-ignore
      expect(reduceConnectParams([''], DEFAULT_DEVICE)).toEqual([])
      expect(reduceConnectParams([], DEFAULT_DEVICE)).toEqual([])
    })

    it('should ignore invalid string to call in serial', () => {
      const res = [
        [{ type, params: { to_number: '8991111112', from_number, timeout } }]
      ]
      const input = ['', { type, to: '8991111112' }]
      // @ts-ignore
      expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
    })

    it('should ignore invalid input in both serial & parallel specifying from and timeout', () => {
      const res = [
        [
          { type, params: { to_number, from_number, timeout } }
        ],
        [
          { type, params: { to_number: '8991111112', from_number: '8992222226', timeout: 25 } }
        ]
      ]
      const input = [
        { type, to: to_number, from: from_number, timeout },
        [
          { from: '7778', timeout: 25 },
          { to: '', from: '7772', timeout: 25 },
          { type, to: '8991111112', from: '8992222226', timeout: 25 }
        ],
        { to: '', from: '7780', timeout }
      ]
      // @ts-ignore
      expect(reduceConnectParams(input, DEFAULT_DEVICE)).toEqual(res)
    })
  })
})

describe('prepareRecordParams()', () => {
  it('should handle the default empty object', () => {
    const expected = { audio: {} }
    expect(prepareRecordParams({})).toEqual(expected)
  })

  it('should handle audio as nested params', () => {
    const expected = {
      audio: { beep: true, format: 'mp3', direction: 'listen' }
    }
    const input = {
      audio: { beep: true, format: 'mp3', direction: 'listen' }
    }
    expect(prepareRecordParams(input)).toEqual(expected)
  })

  it('should handle the flattened params', () => {
    const expected = {
      audio: { beep: true, format: 'mp3', direction: 'listen' }
    }
    const input = { beep: true, format: 'mp3', direction: 'listen' }
    expect(prepareRecordParams(input)).toEqual(expected)
  })

  it('should handle mixed flattened and nested params', () => {
    const expected = {
      audio: { beep: false, format: 'mp3', direction: 'listen' }
    }
    const input = { audio: { beep: false }, format: 'mp3', direction: 'listen' }
    expect(prepareRecordParams(input)).toEqual(expected)
  })

})
