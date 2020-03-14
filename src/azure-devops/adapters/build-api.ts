import { IBuildApi } from "azure-devops-node-api/BuildApi"
import { BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces"
import { azureConnection } from "./connection"

class BuildApi {

  private _buildApi: IBuildApi | null = null

  /*private*/ async getApi(): Promise<IBuildApi> {
    if (!this._buildApi) {
      this._buildApi = await azureConnection.get().getBuildApi()
    }
    return this._buildApi
  }

  async findBuildDefinitionByNameAndPath(name: string, path: string, project: string): Promise<BuildDefinition | null> {
    const api = await this.getApi()
    const search = await api.getDefinitions(project, name, undefined, undefined, undefined, undefined, undefined, undefined, undefined, path, undefined, undefined, true, false, undefined, undefined, undefined)
    if (search && search.length) {
      return search[0]
    }
    return null
  }

  async findBuildDefinitionById(id: number, project: string) {
    const api = await this.getApi()
    return api.getDefinition(project, id)
  }

  async findAllBuildDefinitions(project: string): Promise<BuildDefinition[]> {
    const api = await this.getApi()
    return api.getDefinitions(project, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true, false, undefined, undefined, undefined)
  }

  async createBuildDefinition(buildDefinition: BuildDefinition, project: string) {
    const api = await this.getApi()
    return api.createDefinition(buildDefinition, project)
  }

  async updateBuildDefinition(buildDefinition: BuildDefinition, project: string) {
    const api = await this.getApi()
    return api.updateDefinition(buildDefinition, project, buildDefinition.id!)
  }

  async deleteBuildDefinition(buildDefinitionId: number, project: string) {
    const api = await this.getApi()
    return api.deleteDefinition(project, buildDefinitionId)
  }
}

const buildApi = new BuildApi()

export { BuildApi, buildApi }

