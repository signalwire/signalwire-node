export type ResultError = { code: number, message: string }

export type ConnectionCallbacks = {
  onOpen?: () => void,
  onClose?: () => void,
  onMessage?: (data: any) => void,
  onError?: (error: any) => void,
  [key: string]: (...ns: any[]) => void
}