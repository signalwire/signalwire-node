const _isAudioLine = (line: string) => /^m=audio/.test(line)
const _isVideoLine = (line: string) => /^m=video/.test(line)
const _getCodecPayloadType = (line: string) => {
  const pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+')
  const result = line.match(pattern)
  return result && result.length == 2 ? result[1] : null
}

/**
 * Add stereo support hacking the SDP
 * @return the SDP modified
 */
export const sdpStereoHack = (sdp: string) => {
  const endOfLine = '\r\n'
  const sdpLines = sdp.split(endOfLine)

  const opusIndex = sdpLines.findIndex(s => /^a=rtpmap/.test(s) && /opus\/48000/.test(s))
  if (opusIndex < 0) {
    return sdp
  }

  const opusPayload = _getCodecPayloadType(sdpLines[opusIndex])

  const pattern = new RegExp(`a=fmtp:${opusPayload}`)
  const fmtpLineIndex = sdpLines.findIndex(s => pattern.test(s))

  if (fmtpLineIndex >= 0) {
    if (!/stereo=1;/.test(sdpLines[fmtpLineIndex])) { // Append stereo=1 to fmtp line if not already present
      sdpLines[fmtpLineIndex] += '; stereo=1; sprop-stereo=1'
    }
  } else { // create an fmtp line
    sdpLines[opusIndex] += `${endOfLine}a=fmtp:${opusPayload} stereo=1; sprop-stereo=1`
  }

  return sdpLines.join(endOfLine)
}

export const sdpMediaOrderHack = (answer: string, localOffer: string): string => {
  const endOfLine = '\r\n'
  const offerLines = localOffer.split(endOfLine)
  const offerAudioIndex = offerLines.findIndex(_isAudioLine)
  const offerVideoIndex = offerLines.findIndex(_isVideoLine)
  if (offerAudioIndex < offerVideoIndex) {
    return answer
  }

  const answerLines = answer.split(endOfLine)
  const answerAudioIndex = answerLines.findIndex(_isAudioLine)
  const answerVideoIndex = answerLines.findIndex(_isVideoLine)
  const audioLines = answerLines.slice(answerAudioIndex, answerVideoIndex)
  const videoLines = answerLines.slice(answerVideoIndex, (answerLines.length - 1))
  const beginLines = answerLines.slice(0, answerAudioIndex)
  return [...beginLines, ...videoLines, ...audioLines, ''].join(endOfLine)
}

/**
 * Modify the SDP to increase video bitrate
 * @return the SDP modified
 */
export const sdpBitrateHack = (sdp: string, max: number, min: number, start: number) => {
  const endOfLine = '\r\n'
  const lines = sdp.split(endOfLine)
  lines.forEach((line, i) => {
    if (/^a=fmtp:\d*/.test(line)) {
      lines[i] += `;x-google-max-bitrate=${max};x-google-min-bitrate=${min};x-google-start-bitrate=${start}`
    } else if (/^a=mid:(1|video)/.test(line)) {
      lines[i] += `\r\nb=AS:${max}`
    }
  })
  return lines.join(endOfLine)
}

// const sdpAudioRemoveRTPExtensions = (sdp: string, extensionsToFilter: string[]): string => {
//   const endOfLine = '\r\n'

//   let beginLines: string[] = []
//   let audioLines: string[] = []
//   let videoLines: string[] = []
//   const newLines = sdp.split(endOfLine)

//   const offerAudioIndex = newLines.findIndex(_isAudioLine)
//   const offerVideoIndex = newLines.findIndex(_isVideoLine)

//   if (offerAudioIndex < offerVideoIndex) {
//     beginLines = newLines.slice(0, offerAudioIndex)
//     audioLines = newLines.slice(offerAudioIndex, offerVideoIndex)
//     videoLines = newLines.slice(offerVideoIndex, (newLines.length - 1))
//   } else {
//     beginLines = newLines.slice(0, offerVideoIndex)
//     audioLines = newLines.slice(offerAudioIndex, (newLines.length - 1))
//     videoLines = newLines.slice(offerVideoIndex, offerAudioIndex)
//   }

//   const newAudioLines = audioLines.filter((line: string) => {
//     return !(line.includes(extensionsToFilter[0]) || line.includes(extensionsToFilter[1]) || line.includes(extensionsToFilter[2]))
//   })

//   return [...beginLines, ...newAudioLines, ...videoLines, ''].join(endOfLine)
// }

// const sdpAudioRemoveRidMidExtHack = (sdp: string): string => {
//   const extensionsToFilter = [
//     'urn:ietf:params:rtp-hdrext:sdes:mid',
//     'urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id',
//     'urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id',
//   ]
//   return sdpAudioRemoveRTPExtensions(sdp, extensionsToFilter)
// }
