import { ResultError } from '../types'

interface IMessageBase {
  jsonrpc: string
  id: string
}

export interface IChannel { name: string, broadcast_access?: number, subscribe_access?: number }

export interface INode {
  nodeid: string
  certified?: boolean
  authority?: boolean
  provider_data?: {} // TODO: need docs
  identities?: string[] // TODO: need docs
}

export interface IProtocol {
  provider_nodeid: string
  command?: string
  protocol: string
  params: {
    default_rpc_execute_access: number
    default_channel_broadcast_access: number
    default_channel_subscribe_access: number
    channels: IChannel[]
  }
}

export interface ISubscription {
  channel: string
  protocol: string
  subscribers: string[]
}

export interface IAuthority { nodeid: string }

export interface IBladeResultError extends IMessageBase {
  error: ResultError
}

export interface IBladeConnectRequest extends IMessageBase {
  method: string
  params: {
    version: {
      major: number
      minor: number
      revision: number
    }
    sessionid?: string
    authentication?: object
  }
}

export interface IBladeConnectResult extends IMessageBase {
  result: {
    sessionid: string
    nodeid: string
    master_nodeid: string
    routes: INode[]
    protocols: {
      name: string
      default_rpc_execute_access: number
      default_channel_broadcast_access: number
      default_channel_subscribe_access: number,
      providers: { nodeid: string, provider_data: any, identities: any[] }[]
      channels: IChannel[]
    }[]
    subscriptions: ISubscription[]
    authorities: IAuthority[]
  }
}

export interface IBladeExecuteRequest extends IMessageBase {
  method: string
  params: {
    requester_nodeid: string
    responder_nodeid: string
    protocol: string
    method: string
    params: any
  }
}

export interface IBladeExecuteResult extends IMessageBase {
  result: {
    requester_nodeid: string
    responder_nodeid: string
    protocol: string
    result: any
  }
}

export interface IBladeProtocolProviderAdd extends IMessageBase {
  method: string
  params: {
    provider_nodeid: string
    protocol: string
    command?: string
    params: IProtocol['params']
  }
}

export interface IBladeProtocolProviderRemove extends IMessageBase {
  method: string
  params: {
    command: string
    provider_nodeid: string
    protocol: string
  }
}

export interface IBladeAuthority extends IMessageBase {
  method: string
  params: {
    authority_nodeid: string
    command: string
  }
}

export interface IBladeSubscriptionRequest extends IMessageBase {
  method: string
  params: {
    command: string
    protocol: string
    subscriber_nodeid: string
    channels: string[]
    auto_create?: boolean
    downstream?: boolean
  }
}