import { IBuildApi } from "azure-devops-node-api/BuildApi"
import { BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces"
import { azureConnection } from "./connection"

class BuildApi {

  private _buildApi: IBuildApi | null = null

  private async getApi(): Promise<IBuildApi> {
    if (!this._buildApi) {
      this._buildApi = await azureConnection.get().getBuildApi()
    }
    return this._buildApi
  }

  async findBuildDefinitionByNameAndPath(name: string, path: string, project: string): Promise<BuildDefinition | null> {
    const api = await this.getApi()
    const search = await api.getDefinitions(project, name, undefined, undefined, undefined, undefined, undefined, undefined, undefined, path, undefined, undefined, undefined, false, undefined, undefined, undefined)
    if (search && search.length) {
      return search[0]
    }
    return null
  }
}

const buildApi = new BuildApi()

export {
  BuildApi,
  buildApi
}
