import log from 'loglevel'
import { azureConnection } from '../../azure-devops/adapters/connection'

export default async () => {
  const api = await azureConnection.get().getTaskAgentApi()
  const response = await api.getVariableGroups('Webfoundation', 'Config PRD')
  log.info(`response: ${JSON.stringify(response)}`)
}
