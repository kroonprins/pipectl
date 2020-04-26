import { log } from '@kroonprins/pipectl/dist/util/logging'
import { ICoreApi } from 'azure-devops-node-api/CoreApi'
import memoize from 'p-memoize'
import { azureConnection } from './connection'

class CoreApi {
  private _coreApi: ICoreApi | null = null

  private async getApi(): Promise<ICoreApi> {
    if (!this._coreApi) {
      log.debug('Initializing CoreAPI')
      this._coreApi = await azureConnection.get().getCoreApi()
      log.debug('Initialized CoreAPI')
    }
    return this._coreApi
  }

  findProjectIdByName = memoize(this._findProjectIdByName)

  private async _findProjectIdByName(name: string): Promise<string> {
    log.debug(`[CoreApi._findProjectIdByName] name[${name}]`)
    const api = await this.getApi()
    const search = await api.getProjects()
    if (search && search.length) {
      const project = search.filter((p) => p.name === name)
      if (project && project.length && project[0].id) {
        return project[0].id
      }
    }
    throw new Error(
      `Project with name ${name} not found. It either doesn't exist or you do not have the required access for it.`
    )
  }
}

const coreApi = new CoreApi()

export { CoreApi, coreApi }
