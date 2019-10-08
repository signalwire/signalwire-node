export * from './HangupResult'
export * from './RecordResult'
export * from './AnswerResult'
export * from './PlayResult'
export * from './PromptResult'
export * from './ConnectResult'
export * from './DialResult'
export * from './FaxResult'
export * from './DetectResult'
export * from './TapResult'
export * from './SendDigitsResult'

export class PlayPauseResult {
  constructor(public successful: boolean) { }
}

export class PlayResumeResult {
  constructor(public successful: boolean) { }
}
