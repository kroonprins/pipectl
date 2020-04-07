import { log } from 'pipectl-core/src/util/logging'
import { azureConnection } from '../adapters/connection'

export default async () => {
  const api = await azureConnection.get().getTaskAgentApi()
  const response = await api.getAgentQueuesByNames(['MS-NONPRD-WE'], 'Webfoundation')
  // const response = await api.getAgentQueues('Webfoundation')
  log.info(`response: ${JSON.stringify(response)}`)
}
