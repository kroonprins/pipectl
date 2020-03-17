import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { IReleaseApi } from 'azure-devops-node-api/ReleaseApi'
import log from 'loglevel'
import { azureConnection } from './connection'

class ReleaseApi {

  private _releaseApi: IReleaseApi | null = null

  /*private*/ async getApi(): Promise<IReleaseApi> {
    if (!this._releaseApi) {
      log.debug('Initializing ReleaseAPI')
      this._releaseApi = await azureConnection.get().getReleaseApi()
      log.debug('Initialized ReleaseAPI')
    }
    return this._releaseApi
  }

  async findReleaseDefinitionByNameAndPath(name: string, path: string, project: string): Promise<ReleaseDefinition | null> {
    log.debug(`[ReleaseApi.findReleaseDefinitionByNameAndPath] name[${name}], path[${path}], project[${project}]`)
    const api = await this.getApi()
    const search = await api.getReleaseDefinitions(project, name, undefined, undefined, undefined, 1, undefined, undefined, path, true, undefined, undefined, undefined, undefined, undefined)
    if (search && search.length) {
      log.debug(`[ReleaseApi.findReleaseDefinitionByNameAndPath] found ${search[0].id} (${search.length}) for name[${name}], path[${path}], project[${project}]`)
      return search[0]
    }
    log.debug(`[ReleaseApi.findReleaseDefinitionByNameAndPath] not found for name[${name}], path[${path}], project[${project}]`)
    return null
  }

  async findReleaseDefinitionById(id: number, project: string) {
    log.debug(`[ReleaseApi.findReleaseDefinitionById] id[${id}], project[${project}]`)
    const api = await this.getApi()
    return api.getReleaseDefinition(project, id)
  }

  async findAllReleaseDefinitions(project: string) {
    log.debug(`[ReleaseApi.findAllReleaseDefinitions] project[${project}]`)
    const api = await this.getApi()
    return api.getReleaseDefinitions(project, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, undefined)
  }

  async createReleaseDefinition(releaseDefinition: ReleaseDefinition, project: string) {
    log.debug(`[ReleaseApi.createReleaseDefinition] ${releaseDefinition.path}\\${releaseDefinition.name}, project[${project}]`)
    const api = await this.getApi()
    return api.createReleaseDefinition(releaseDefinition, project)
  }

  async updateReleaseDefinition(releaseDefinition: ReleaseDefinition, project: string) {
    log.debug(`[ReleaseApi.updateReleaseDefinition] ${releaseDefinition.path}\\${releaseDefinition.name}, project[${project}]`)
    const api = await this.getApi()
    return api.updateReleaseDefinition(releaseDefinition, project)
  }

  async deleteReleaseDefinition(releaseDefinitionId: number, project: string) {
    log.debug(`[ReleaseApi.deleteReleaseDefinition] id[${releaseDefinitionId}], project[${project}]`)
    const api = await this.getApi()
    return api.deleteReleaseDefinition(project, releaseDefinitionId)
  }
}

const releaseApi = new ReleaseApi()

export { ReleaseApi, releaseApi }

