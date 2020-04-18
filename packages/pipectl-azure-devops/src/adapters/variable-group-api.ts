import { log } from '@kroonprins/pipectl/dist/util/logging'
import { VariableGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { ITaskAgentApi } from 'azure-devops-node-api/TaskAgentApi'
import memoize from 'p-memoize'
import { azureConnection } from './connection'
import { coreApi } from './core-api'

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

  findVariableGroupIdByName = memoize(this._findVariableGroupIdByName, {
    cacheKey: JSON.stringify,
  })

  private async _findVariableGroupIdByName(
    name: string,
    project: string
  ): Promise<number> {
    log.debug(
      `[VariableGroupApi._findVariableGroupIdByName] name[${name}], project[${project}]`
    )
    const api = await this.getApi()
    const search = await api.getVariableGroups(project, name)
    if (search && search.length && search[0].id) {
      return search[0].id
    }
    throw new Error(
      `Variable group with name ${name} not found in project ${project}. It either doesn't exist or you do not have the required access for it.`
    )
  }

  async findVariableGroupByName(
    name: string,
    project: string
  ): Promise<VariableGroup | null> {
    log.debug(
      `[VariableGroupApi.findVariableGroupByName] name[${name}], project[${project}]`
    )
    const api = await this.getApi()
    const search = await api.getVariableGroups(project, name)
    if (search && search.length) {
      log.debug(
        `[VariableGroupApi.findVariableGroupByName] found ${search[0].id} (${search.length}) for name[${name}], project[${project}]`
      )
      return search[0]
    }
    log.debug(
      `[VariableGroupApi.findVariableGroupByName] not found for name[${name}], project[${project}]`
    )
    return null
  }

  async findVariableGroupById(id: number, project: string) {
    log.debug(
      `[VariableGroupApi.findVariableGroupById] id[${id}], project[${project}]`
    )
    const api = await this.getApi()
    const variableGroups = await api.getVariableGroupsById(project, [id])
    if (variableGroups && variableGroups.length) {
      return variableGroups[0]
    }
    throw new Error(
      `Variable group with id ${id} not found in project ${project}. It either doesn't exist or you do not have the required access for it.`
    )
  }

  async findAllVariableGroups(project: string) {
    log.debug(`[VariableGroupApi.findAllVariableGroups] project[${project}]`)
    const api = await this.getApi()
    return api.getVariableGroups(project)
  }

  async createVariableGroup(variableGroup: VariableGroup, project: string) {
    log.debug(
      `[VariableGroupApi.createVariableGroup] ${variableGroup.name}, project[${project}]`
    )
    const api = await this.getApi()
    return api.addVariableGroup(variableGroup)
  }

  async updateVariableGroup(variableGroup: VariableGroup, project: string) {
    log.debug(
      `[VariableGroupApi.updateVariableGroup] ${variableGroup.name}, project[${project}]`
    )
    const api = await this.getApi()
    return api.updateVariableGroup(variableGroup, variableGroup.id!)
  }

  async deleteVariableGroup(id: number, project: string) {
    log.debug(
      `[VariableGroupApi.deleteVariableGroup] id[${id}], project[${project}]`
    )
    const api = await this.getApi()
    return api.deleteVariableGroup(id, [
      await coreApi.findProjectIdByName(project),
    ])
  }
}

const variableGroupApi = new VariableGroupApi()

export { VariableGroupApi, variableGroupApi }
