import { IBuildApi } from 'azure-devops-node-api/BuildApi'
import { BuildDefinition } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import log from 'loglevel'
import { azureConnection } from './connection'

class BuildApi {

  private _buildApi: IBuildApi | null = null

  /*private*/ async getApi(): Promise<IBuildApi> {
    if (!this._buildApi) {
      log.debug('Initializing BuildAPI')
      this._buildApi = await azureConnection.get().getBuildApi()
      log.debug('Initialized BuildAPI')
    }
    return this._buildApi
  }

  async findBuildDefinitionByNameAndPath(name: string, path: string, project: string): Promise<BuildDefinition | null> {
    log.debug(`[BuildApi.findBuildDefinitionByNameAndPath] name[${name}], path[${path}], project[${project}]`)
    const api = await this.getApi()
    const search = await api.getDefinitions(project, name, undefined, undefined, undefined, undefined, undefined, undefined, undefined, path, undefined, undefined, true, false, undefined, undefined, undefined)
    if (search && search.length) {
      log.debug(`[BuildApi.findBuildDefinitionByNameAndPath] found ${search[0].id} (${search.length}) for name[${name}], path[${path}], project[${project}]`)
      return search[0]
    }
    log.debug(`[BuildApi.findBuildDefinitionByNameAndPath] not found for name[${name}], path[${path}], project[${project}]`)
    return null
  }

  async findBuildDefinitionById(id: number, project: string) {
    log.debug(`[BuildApi.findBuildDefinitionById] id[${id}], project[${project}]`)
    const api = await this.getApi()
    return api.getDefinition(project, id)
  }

  async findAllBuildDefinitions(project: string): Promise<BuildDefinition[]> {
    log.debug(`[BuildApi.findAllBuildDefinitions] project[${project}]`)
    const api = await this.getApi()
    return api.getDefinitions(project, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true, false, undefined, undefined, undefined)
  }

  async createBuildDefinition(buildDefinition: BuildDefinition, project: string) {
    log.debug(`[BuildApi.createBuildDefinition] ${buildDefinition.path}\\${buildDefinition.name}, project[${project}]`)
    const api = await this.getApi()
    return api.createDefinition(buildDefinition, project)
  }

  async updateBuildDefinition(buildDefinition: BuildDefinition, project: string) {
    log.debug(`[BuildApi.updateBuildDefinition] ${buildDefinition.path}\\${buildDefinition.name}, project[${project}]`)
    const api = await this.getApi()
    return api.updateDefinition(buildDefinition, project, buildDefinition.id!)
  }

  async deleteBuildDefinition(buildDefinitionId: number, project: string) {
    log.debug(`[BuildApi.updateBuildDefinition] id[${buildDefinitionId}], project[${project}]`)
    const api = await this.getApi()
    return api.deleteDefinition(project, buildDefinitionId)
  }
}

const buildApi = new BuildApi()

export { BuildApi, buildApi }

