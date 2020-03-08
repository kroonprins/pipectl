import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { WebApi, getBasicHandler } from "azure-devops-node-api"
import { currentServer, currentUser } from "../core/config"
import { IReleaseApi } from "azure-devops-node-api/ReleaseApi"

const getAuthProvider = () => {
    const user = currentUser()
    switch (user['auth-provider'].name) {
        case 'azure-devops-username':
            // TODO prompt if not present?
            return getBasicHandler(user['auth-provider'].config.name!, user['auth-provider'].config.password!)
        default:
            throw new Error(`Unhandled authentication provider ${user['auth-provider'].name}`)
    }
}

class ReleaseApi {

    private _releaseApi: IReleaseApi | null = null

    private async getApi(): Promise<IReleaseApi> {
        if (!this._releaseApi) {
            const connection = new WebApi(currentServer()['base-url'], getAuthProvider())
            this._releaseApi = await connection.getReleaseApi()
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
        return api.getReleaseDefinitions(project,undefined,undefined,undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, undefined)
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

export {
    ReleaseApi,
    releaseApi,
}