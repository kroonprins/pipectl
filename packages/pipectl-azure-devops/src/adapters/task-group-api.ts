import { log } from '@kroonprins/pipectl/dist/util/logging'
import {
  TaskGroup,
  TaskGroupCreateParameter,
  TaskGroupUpdateParameter,
} from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
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

  async findTaskGroupByName(
    name: string,
    majorVersion: number,
    project: string
  ): Promise<TaskGroup | undefined> {
    log.debug(
      `[TaskGroupApi.findTaskGroupByName] name[${name}], project[${project}]`
    )
    const api = await this.getApi()
    const search = await api.getTaskGroups(project)
    if (search && search.length) {
      const found = search.find(
        (taskGroup) =>
          taskGroup.name === name && taskGroup.version?.major === majorVersion
      )
      log.debug(
        `[TaskGroupApi.findTaskGroupByName] found ${found} (${search.length}) for name[${name}], project[${project}]`
      )
      return found
    }
    log.debug(
      `[TaskGroupApi.findTaskGroupByName] not found for name[${name}], project[${project}]`
    )
    return undefined
  }

  async findTaskGroupByNameWithoutVersion(
    name: string,
    project: string
  ): Promise<TaskGroup | undefined> {
    return this.findTaskGroupByName(name, 1, project) // a major version 1 should always exist
  }

  async findTaskGroupById(
    id: string,
    majorVersion: number,
    project: string
  ): Promise<TaskGroup> {
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

  async findTaskGroupByIdWithoutVersion(
    id: string,
    project: string
  ): Promise<TaskGroup> {
    return this.findTaskGroupById(id, 1, project) // a major version 1 should always exist
  }

  async findAllTaskGroups(project: string) {
    log.debug(`[TaskGroupApi.findAllTaskGroups] project[${project}]`)
    const api = await this.getApi()
    return api.getTaskGroups(project)
  }

  async createTaskGroup(taskGroup: TaskGroupCreateParameter, project: string) {
    log.debug(
      `[TaskGroupApi.createTaskGroup] ${taskGroup.name}, project[${project}]`
    )
    const api = await this.getApi()
    return api.addTaskGroup(taskGroup, project)
  }

  async updateTaskGroup(taskGroup: TaskGroupUpdateParameter, project: string) {
    log.debug(
      `[TaskGroupApi.updateTaskGroup] ${taskGroup.name}, project[${project}]`
    )
    const api = await this.getApi()
    return api.updateTaskGroup(taskGroup, project, taskGroup.id)
  }

  async deleteTaskGroup(id: string, project: string) {
    log.debug(`[TaskGroupApi.deleteTaskGroup] id[${id}], project[${project}]`)
    const api = await this.getApi()
    return api.deleteTaskGroup(project, id)
  }
}

const taskGroupApi = new TaskGroupApi()

export { TaskGroupApi, taskGroupApi }
