import { reduceConnectParams, prepareRecordParams, preparePlayParams, preparePromptParams, preparePromptAudioParams, preparePromptTTSParams, prepareTapParams } from '../../src/relay/helpers'
import { ICallDevice, ICallingTapTap, ICallingTapDevice, ICallingTapFlat, ICallingPlayParams } from '../../src/util/interfaces'

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

describe('preparePlayParams()', () => {
  it('should handle no parameters', () => {
    expect(preparePlayParams([])).toEqual([[], 0])
  })

  it('should handle nested params', () => {
    const expected = [
      { type: 'audio', params: { url: 'audio.mp3' } },
      { type: 'tts', params: { text: 'welcome' } }
    ]
    const input = [
      { type: 'audio', params: { url: 'audio.mp3' } },
      { type: 'tts', params: { text: 'welcome' } }
    ]
    expect(preparePlayParams(input)).toEqual([expected, 0])
  })

  it('should handle the flattened params', () => {
    const expected = [
      { type: 'audio', params: { url: 'audio.mp3' } },
      { type: 'tts', params: { text: 'welcome', gender: 'male' } }
    ]
    const input = [
      { type: 'audio', url: 'audio.mp3' },
      { type: 'tts', text: 'welcome', gender: 'male' }
    ]
    expect(preparePlayParams(input)).toEqual([expected, 0])
  })

  it('should handle mixed flattened and nested params', () => {
    const expected = [
      { type: 'audio', params: { url: 'audio.mp3' } },
      { type: 'tts', params: { text: 'welcome', gender: 'male' } }
    ]
    const input = [
      { type: 'audio', params: { url: 'audio.mp3' } },
      { type: 'tts', text: 'welcome', gender: 'male' }
    ]
    expect(preparePlayParams(input)).toEqual([expected, 0])
  })

  it('should handle ICallingPlayParams with media and volume properties', () => {
    const expected = [
      { type: 'audio', params: { url: 'audio.mp3' } },
      { type: 'tts', params: { text: 'welcome', gender: 'male' } }
    ]
    const input: [ICallingPlayParams] = [{
      media: [
        { type: 'audio', params: { url: 'audio.mp3' } },
        { type: 'tts', text: 'welcome', gender: 'male' }
      ],
      volume: 4
    }]
    expect(preparePlayParams(input)).toEqual([expected, 4])
  })
})

describe('preparePromptParams()', () => {
  it('should handle only required parameters', () => {
    const collectExpected = { initial_timeout: 5, digits: {}, speech: {} }
    const playExpected = [
      { type: 'audio', params: { url: 'audio.mp3' } },
      { type: 'tts', params: { text: 'hello', gender: 'male' } }
    ]
    const params = {
      initial_timeout: 5,
      type: 'both',
      media: [
        { type: 'audio', url: 'audio.mp3' },
        { type: 'tts', text: 'hello', gender: 'male' }
      ]
    }
    expect(preparePromptParams(params)).toEqual([collectExpected, playExpected, 0])
  })

  it('should handle nested params', () => {
    const collectExpected = {
      initial_timeout: 5,
      digits: {
        max: 5, digit_timeout: 2, terminators: '#'
      }
    }
    const playExpected = [
      { type: 'audio', params: { url: 'audio.mp3' } },
      { type: 'tts', params: { text: 'hello', gender: 'male' } }
    ]
    expect(preparePromptParams(collectExpected, playExpected)).toEqual([collectExpected, playExpected, 0])
  })

  it('should handle nested params and flattened media', () => {
    const collectExpected = {
      initial_timeout: 5,
      speech: {
        end_silence_timeout: 5
      }
    }
    const playExpected = [
      { type: 'audio', params: { url: 'audio.mp3' } },
      { type: 'tts', params: { text: 'hello', gender: 'male' } }
    ]
    const playFlat = [
      { type: 'audio', url: 'audio.mp3' },
      { type: 'tts', text: 'hello', gender: 'male' }
    ]
    expect(preparePromptParams(collectExpected, playFlat)).toEqual([collectExpected, playExpected, 0])
  })

  it('should handle flattened params', () => {
    const collectExpected = {
      initial_timeout: 5,
      digits: {
        max: 3, digit_timeout: 2, terminators: '#'
      },
      speech: {
        speech_timeout: 3,
        end_silence_timeout: 3
      }
    }
    const playExpected = [
      { type: 'audio', params: { url: 'audio.mp3' } },
      { type: 'tts', params: { text: 'hello', gender: 'male' } }
    ]
    const params = {
      initial_timeout: 5,
      digits_max: 3,
      digits_timeout: 2,
      digits_terminators: '#',
      end_silence_timeout: 3,
      speech_timeout: 3,
      NOT_EXISTS: 'this will be ignored',
      media: [
        { type: 'audio', url: 'audio.mp3' },
        { type: 'tts', text: 'hello', gender: 'male' }
      ]
    }
    expect(preparePromptParams(params)).toEqual([collectExpected, playExpected, 0])
  })

  it('should handle flattened params without media', () => {
    const collectExpected = {
      initial_timeout: 5,
      speech: {
        end_silence_timeout: 3
      }
    }
    const playExpected = []
    const params = { initial_timeout: 5, end_silence_timeout: 3 }
    expect(preparePromptParams(params)).toEqual([collectExpected, playExpected, 0])
  })

  it('should handle flattened params with volume property', () => {
    const collectExpected = {
      initial_timeout: 5,
      speech: {
        end_silence_timeout: 3
      }
    }
    const playExpected = [
      { type: 'audio', params: { url: 'audio.mp3' } }
    ]
    const params = {
      volume: -6,
      initial_timeout: 5,
      end_silence_timeout: 3,
      media: [
        { type: 'audio', url: 'audio.mp3' }
      ]
    }
    expect(preparePromptParams(params)).toEqual([collectExpected, playExpected, -6])
  })
})

describe('preparePromptAudioParams()', () => {
  it('should handle only required parameters', () => {
    const expected = {
      initial_timeout: 5,
      media: [
        { type: 'audio', params: { url: 'audio.mp3' } }
      ]
    }
    const params = { initial_timeout: 5, url: 'audio.mp3' }
    expect(preparePromptAudioParams(params)).toEqual(expected)

    expect(preparePromptAudioParams({ initial_timeout: 5 }, 'audio.mp3')).toEqual(expected)
  })
})

describe('preparePromptTTSParams()', () => {
  it('should handle only required parameters', () => {
    const expected = {
      initial_timeout: 5,
      media: [
        { type: 'tts', params: { text: 'hello', gender: 'male' } }
      ]
    }
    const params = { initial_timeout: 5, text: 'hello', gender: 'male' }
    expect(preparePromptTTSParams(params)).toEqual(expected)

    expect(preparePromptTTSParams({ initial_timeout: 5 }, { text: 'hello', gender: 'male' })).toEqual(expected)
  })
})

describe('prepareTapParams()', () => {
  it('should handle parameters with "old" tap and device', () => {
    const tapExpected = { type: 'audio', params: { direction: 'listen' } }
    const deviceExpected = { type: 'rtp', params: { addr: '127.0.0.1', port: 1234 } }

    const tap: ICallingTapTap = { type: 'audio', direction: 'listen' }
    const device: ICallingTapDevice = { type: 'rtp', addr: '127.0.0.1', port: 1234 }
    expect(prepareTapParams(tap, device)).toEqual({ tap: tapExpected, device: deviceExpected })
  })

  it('should handle all flattened parameters', () => {
    const tapExpected = { type: 'audio', params: { direction: 'listen' } }
    const deviceExpected = { type: 'rtp', params: { addr: '127.0.0.1', port: 1234 } }

    const tap: ICallingTapFlat = {
      audio_direction: 'listen',
      target_type: 'rtp',
      target_addr: '127.0.0.1',
      target_port: 1234
    }
    expect(prepareTapParams(tap)).toEqual({ tap: tapExpected, device: deviceExpected })
  })

  it('should handle all flattened parameters without direction', () => {
    const tapExpected = { type: 'audio', params: { } }
    const deviceExpected = { type: 'rtp', params: { addr: '127.0.0.1', port: 1234, codec: 'OPUS' } }

    const tap: ICallingTapFlat = {
      target_type: 'rtp',
      target_addr: '127.0.0.1',
      target_port: 1234,
      codec: 'OPUS'
    }
    expect(prepareTapParams(tap)).toEqual({ tap: tapExpected, device: deviceExpected })
  })
})
