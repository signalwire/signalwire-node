import uuidv4 from 'uuid/v4'

abstract class BaseMessage {
  jsonrpc: string = '2.0'
  id: string = uuidv4()
}

export default BaseMessage