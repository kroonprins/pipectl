import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { IReleaseApi } from "azure-devops-node-api/ReleaseApi"
import { azureConnection } from "./connection"

class ReleaseApi {

  private _releaseApi: IReleaseApi | null = null

  private async getApi(): Promise<IReleaseApi> {
    if (!this._releaseApi) {
      this._releaseApi = await azureConnection.get().getReleaseApi()
    }
    return this._releaseApi
  }

  async findReleaseDefinitionByNameAndPath(name: string, path: string, project: string): Promise<ReleaseDefinition | null> {
    const api = await this.getApi()
    const search = await api.getReleaseDefinitions(project, name, undefined, undefined, undefined, 1, undefined, undefined, path, true, undefined, undefined, undefined, undefined, undefined)
    if (search && search.length) {
      return search[0]
    }
    return null
  }

  async findReleaseDefinitionById(id: number, project: string) {
    const api = await this.getApi()
    return api.getReleaseDefinition(project, id)
  }

  async findAllReleaseDefinitions(project: string) {
    const api = await this.getApi()
    return api.getReleaseDefinitions(project, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, undefined)
  }

  async createReleaseDefinition(releaseDefinition: ReleaseDefinition, project: string) {
    const api = await this.getApi()
    return api.createReleaseDefinition(releaseDefinition, project)
  }

  async updateReleaseDefinition(releaseDefinition: ReleaseDefinition, project: string) {
    const api = await this.getApi()
    return api.updateReleaseDefinition(releaseDefinition, project)
  }

  async deleteReleaseDefinition(releaseDefinitionId: number, project: string) {
    const api = await this.getApi()
    return api.deleteReleaseDefinition(project, releaseDefinitionId)
  }
}

const releaseApi = new ReleaseApi()

export { ReleaseApi, releaseApi }

