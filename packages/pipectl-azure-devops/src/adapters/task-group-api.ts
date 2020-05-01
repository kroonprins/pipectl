import { log } from '@kroonprins/pipectl/dist/util/logging'
import { ITaskAgentApi } from 'azure-devops-node-api/TaskAgentApi'
import { azureConnection } from './connection'

class TaskGroupApi {
  private _taskAgentApi: ITaskAgentApi | null = null

  private async getApi(): Promise<ITaskAgentApi> {
    if (!this._taskAgentApi) {
      log.debug('Initializing TaskGroupAPI')
      this._taskAgentApi = await azureConnection.get().getTaskAgentApi()
      log.debug('Initialized TaskGroupAPI')
    }
    return this._taskAgentApi
  }

  async findTaskGroupById(id: string, majorVersion: string, project: string) {
    log.debug(
      `[TaskGroupApi.findTaskGroupById] id[${id}], majorVersion[${majorVersion}], project[${project}]`
    )
    const api = await this.getApi()
    const taskGroup = await api.getTaskGroup(project, id, `${majorVersion}.*`)
    if (taskGroup) {
      return taskGroup
    }
    throw new Error(
      `Task group with id ${id} not found in project ${project}. It either doesn't exist or you do not have the required access for it.`
    )
  }

  async findAllTaskGroups(project: string) {
    log.debug(`[TaskGroupApi.findAllTaskGroups] project[${project}]`)
    const api = await this.getApi()
    return api.getTaskGroups(project)
  }
}

const taskGroupApi = new TaskGroupApi()

export { TaskGroupApi, taskGroupApi }
