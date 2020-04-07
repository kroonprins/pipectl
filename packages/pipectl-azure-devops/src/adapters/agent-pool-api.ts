import { ITaskAgentApi } from 'azure-devops-node-api/TaskAgentApi'
import memoize from 'p-memoize'
import { log } from 'pipectl-core/dist/util/logging'
import { azureConnection } from './connection'

class AgentPoolApi {

  private _taskAgentApi: ITaskAgentApi | null = null

  /*private*/ async getApi(): Promise<ITaskAgentApi> {
    if (!this._taskAgentApi) {
      log.debug('Initializing AgentPoolApi')
      this._taskAgentApi = await azureConnection.get().getTaskAgentApi()
      log.debug('Initialized AgentPoolApi')
    }
    return this._taskAgentApi
  }

  findAgentPoolIdByName = memoize(this._findAgentPoolIdByName, { cacheKey: JSON.stringify })

  private async _findAgentPoolIdByName(name: string, project: string): Promise<number> {
    log.debug(`[AgentPoolApi._findAgentPoolIdByName] name[${name}], project[${project}]`)
    const api = await this.getApi()
    const search = await api.getAgentQueuesByNames([name], project)
    if (search && search.length && search[0].id) {
      return search[0].id
    }
    throw new Error(`Agent pool with name ${name} not found in project ${project}. It either doesn't exist or you do not have the required access for it.`)
  }
}

const agentPoolApi = new AgentPoolApi()

export { AgentPoolApi, agentPoolApi }
