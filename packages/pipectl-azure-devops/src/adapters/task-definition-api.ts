import { log } from '@kroonprins/pipectl/dist/util/logging'
import { TaskDefinition } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { ITaskAgentApi } from 'azure-devops-node-api/TaskAgentApi'
import memoize from 'p-memoize'
import { azureConnection } from './connection'

class TaskDefinitionApi {
  private _taskAgentApi: ITaskAgentApi | null = null

  private async getApi(): Promise<ITaskAgentApi> {
    if (!this._taskAgentApi) {
      log.debug('Initializing TaskDefinitionAPI')
      this._taskAgentApi = await azureConnection.get().getTaskAgentApi()
      log.debug('Initialized TaskDefinitionAPI')
    }
    return this._taskAgentApi
  }

  findTaskDefinitionIdByName = memoize(this._findTaskDefinitionIdByName)
  findTaskDefinitionNameById = memoize(this._findTaskDefinitionNameById)
  private findTaskDefinitions = memoize(this._findTaskDefinitions)

  private async _findTaskDefinitionIdByName(name: string): Promise<string> {
    log.debug(`[TaskDefinitionApi._findTaskDefinitionIdByName] name[${name}]`)
    const taskDefinitions = await this.findTaskDefinitions()
    if (taskDefinitions && taskDefinitions.length) {
      log.debug(
        `[TaskDefinitionApi._findTaskDefinitionIdByName] ${taskDefinitions.length} results`
      )
      const found = taskDefinitions.find(
        (taskDefinition) =>
          taskDefinition.name?.toLowerCase() === name.toLowerCase() ||
          taskDefinition.friendlyName?.toLowerCase() === name.toLowerCase()
      )
      log.debug(
        `[TaskDefinitionApi._findTaskDefinitionIdByName] found[${JSON.stringify(
          found
        )}] for name[${name}]`
      )
      if (found && found.id) {
        return found.id
      }
    }
    throw new Error(
      `Task definition with name ${name} not found. It either doesn't exist or you do not have the required access for it.`
    )
  }

  private async _findTaskDefinitionNameById(
    id: string
  ): Promise<string | undefined> {
    log.debug(`[TaskDefinitionApi._findTaskDefinitionNameById] name[${id}]`)
    const taskDefinitions = await this.findTaskDefinitions()
    if (taskDefinitions && taskDefinitions.length) {
      log.debug(
        `[TaskDefinitionApi._findTaskDefinitionNameById] ${taskDefinitions.length} results`
      )
      const matching = taskDefinitions.filter(
        (taskDefinition) => taskDefinition.id === id
      )
      log.debug(
        `[TaskDefinitionApi._findTaskDefinitionIdByName] matching[${JSON.stringify(
          matching
        )}] for id[${id}]`
      )
      if (matching && matching.length) {
        const sorted = matching.sort((a, b) => {
          const major = b.version!.major! - a.version!.major!
          return major !== 0 ? major : b.version!.minor! - a.version!.minor!
        })
        log.debug(
          `[TaskDefinitionApi._findTaskDefinitionIdByName] selected[${sorted[0]}] for id[${id}]`
        )
        return sorted[0].friendlyName || sorted[0].name
      }
    }
    return undefined
  }

  private async _findTaskDefinitions(): Promise<TaskDefinition[]> {
    const api = await this.getApi()
    return (await api.getTaskDefinitions()).map((taskDefinition) => {
      return {
        id: taskDefinition.id,
        name: taskDefinition.name,
        friendlyName: taskDefinition.friendlyName,
        version: taskDefinition.version,
      }
    })
  }
}

const taskDefinitionApi = new TaskDefinitionApi()

export { TaskDefinitionApi, taskDefinitionApi }
