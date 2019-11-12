import { prepareRecordParams, preparePlayParams, preparePlayAudioParams, preparePromptParams, preparePromptAudioParams, preparePromptTTSParams, prepareTapParams, prepareDevices } from '../../src/relay/helpers'
import { ICallingTapTap, ICallingTapDevice, ICallingTapFlat, ICallingPlayParams } from '../../src/util/interfaces'

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

describe('preparePlayAudioParams()', () => {
  it('should handle string or object', () => {
    expect(preparePlayAudioParams('audio.mp3')).toEqual(['audio.mp3', 0])
    expect(preparePlayAudioParams({ url: 'audio.mp3', volume: 6.5 })).toEqual(['audio.mp3', 6.5])
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

describe('prepareDevices()', () => {
  const from = 'from'
  const to = 'to'
  const appid = 'appid'
  const channel = 'channel'
  const codecs = ['PCMU', 'OPUS']
  const timeout = 30

  it('should handle single device to dial', () => {
    const final = [
      [{ type: 'agora', params: { to, from, appid, channel, timeout } }]
    ]

    const devices = [
      { type: 'agora' as 'agora', to, from, appId: appid, channel, timeout }
    ]
    expect(prepareDevices(devices, 'def-from', undefined)).toEqual(final)
  })

  it('should handle multiple devices in series', () => {
    const final = [
      [{ type: 'phone', params: { to_number: to, from_number: from } }],
      [{ type: 'agora', params: { to, from, appid, channel } }],
      [{ type: 'sip', params: { to, from, codecs, headers: {}, webrtc_media: false } }]
    ]

    const devices = [
      { type: 'phone' as 'phone', to, from },
      { type: 'agora' as 'agora', to, from, appId: appid, channel },
      { type: 'sip' as 'sip', to, from, webrtcMedia: false, headers: {}, codecs }
    ]
    expect(prepareDevices(devices, 'def-from', undefined)).toEqual(final)
  })

  it('should handle multiple devices in parallel', () => {
    const final = [
      [
        { type: 'phone', params: { to_number: to, from_number: from } },
        { type: 'agora', params: { to, from, appid, channel } },
        { type: 'sip', params: { to, from } }
      ]
    ]

    const devices = [
      [
        { type: 'phone' as 'phone', to, from },
        { type: 'agora' as 'agora', to, from, appId: appid, channel },
        { type: 'sip' as 'sip', to, from }
      ]
    ]
    expect(prepareDevices(devices, 'def-from', undefined)).toEqual(final)
  })

  it('should handle multiple devices in series and parallel', () => {
    const final = [
      [
        { type: 'phone', params: { to_number: to, from_number: 'def-from' } },
      ],
      [
        { type: 'phone', params: { to_number: to, from_number: 'def-from' } },
        { type: 'agora', params: { to, from: 'def-from', appid, channel } },
        { type: 'sip', params: { to, from: 'def-from' } }
      ],
      [
        { type: 'webrtc', params: { to, from: 'def-from', codecs } },
      ]
    ]

    const devices = [
      { type: 'phone' as 'phone', to },
      [
        { type: 'phone' as 'phone', to },
        { type: 'agora' as 'agora', to, appId: appid, channel },
        { type: 'sip' as 'sip', to }
      ],
      { type: 'webrtc' as 'webrtc', to, codecs }
    ]
    expect(prepareDevices(devices, 'def-from', undefined)).toEqual(final)
  })

  it('should handle multiple devices - in series and parallel - with default values', () => {
    const final = [
      [
        { type: 'phone', params: { to_number: to, from_number: from, timeout: 20 } },
      ],
      [
        { type: 'phone', params: { to_number: to, from_number: from, timeout: 20 } },
        { type: 'agora', params: { to, from: 'def-from', appid, channel, timeout: 60 } },
        { type: 'sip', params: { to, from: 'def-from', timeout: 60 } }
      ],
      [
        { type: 'webrtc', params: { to, from: 'def-from', codecs, timeout: 20 } },
      ]
    ]

    const devices = [
      { type: 'phone' as 'phone', to, from },
      [
        { type: 'phone' as 'phone', to, from },
        { type: 'agora' as 'agora', to, appId: appid, channel, timeout: 60 },
        { type: 'sip' as 'sip', to, timeout: 60 }
      ],
      { type: 'webrtc' as 'webrtc', to, codecs }
    ]
    expect(prepareDevices(devices, 'def-from', 20)).toEqual(final)
  })
})
