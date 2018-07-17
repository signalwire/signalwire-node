import logger from './util/logger'
import Session from './services/Session'
import { ProviderAdd, ProviderRemove } from './blade/BladeProtocol'
import { BladeExecuteRequest, BladeExecuteResponse } from './blade/BladeExecute'

export { Session }
// const sessionReady = (): void => {

//   // const pa = new ProviderAdd({
//   //   provider_nodeid: s1.nodeid,
//   //   protocol: 'bench',
//   //   params: {
//   //     default_rpc_execute_access: 1,
//   //     default_channel_broadcast_access: 1,
//   //     default_channel_subscribe_access: 1,
//   //     channels: [
//   //       { name: 'swbench', broadcast_access: 1, subscribe_access: 1 }
//   //     ]
//   //   }
//   // })
//   // logger.info("ProviderAdd: ", JSON.stringify(pa))

//   // const pr = new ProviderRemove(s1.nodeid, 'bench')
//   // logger.info("ProviderRemove: ", JSON.stringify(pr))
//   // s.conn.send(pa.message)


// }
// const s1 = new Session(() => {

//   const s2 = new Session(() => {
//     const req = new BladeExecuteRequest({
//       requester_nodeid: s1.nodeid,
//       responder_nodeid: s2.nodeid,
//       protocol: 'myprot',
//       method: 'addNum',
//       params: {
//         yo: 'pippo'
//       }
//     })
//     s1.conn.send(req)
//       .then(() => {
//         console.log('RESPONDER HAS DONE ITS WORK')
//       })

//     const res = new BladeExecuteResponse({
//       requester_nodeid: s1.nodeid,
//       responder_nodeid: s2.nodeid,
//       protocol: 'myprot',
//       result: {
//         ciao: 'pippo'
//       }
//     })
//     res.id = req.id
//     s2.conn.send(res)
//   })
// })
