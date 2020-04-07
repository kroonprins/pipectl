import { ITaskAgentApi } from 'azure-devops-node-api/TaskAgentApi'
import memoize from 'p-memoize'
import { log } from 'pipectl-core/dist/util/logging'
import { azureConnection } from './connection'

class VariableGroupApi {

  private _taskAgentApi: ITaskAgentApi | null = null

  /*private*/ async getApi(): Promise<ITaskAgentApi> {
    if (!this._taskAgentApi) {
      log.debug('Initializing VariableGroupAPI')
      this._taskAgentApi = await azureConnection.get().getTaskAgentApi()
      log.debug('Initialized VariableGroupAPI')
    }
    return this._taskAgentApi
  }

  findVariableGroupIdByName = memoize(this._findVariableGroupIdByName, { cacheKey: JSON.stringify })

  private async _findVariableGroupIdByName(name: string, project: string): Promise<number> {
    log.debug(`[VariableGroupApi._findVariableGroupIdByName] name[${name}], project[${project}]`)
    const api = await this.getApi()
    const search = await api.getVariableGroups(project, name)
    if (search && search.length && search[0].id) {
      return search[0].id
    }
    throw new Error(`Variable group with name ${name} not found in project ${project}. It either doesn't exist or you do not have the required access for it.`)
  }
}

const variableGroupApi = new VariableGroupApi()

export { VariableGroupApi, variableGroupApi }

