export interface IMessage {
  id: string
  state: string
  context: string
  from: string
  to: string
  direction: string
  tags: string[]
  body: string
  media: string[]
  segments: number
}


export interface IMessageOptions {
  message_id: string
  message_state: string
  context: string
  from_number: string
  to_number: string
  direction: string
  tags: string[]
  body: string
  media: string[]
  segments: number
  reason?: string
}
