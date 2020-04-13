import {
  currentServer,
  currentUser,
} from '@kroonprins/pipectl-core/dist/config'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import {
  getBasicHandler,
  getBearerHandler,
  getPersonalAccessTokenHandler,
  WebApi,
} from 'azure-devops-node-api'

class AzureConnection {
  private _connection: WebApi | null = null

  public get(): WebApi {
    if (!this._connection) {
      log.debug('Creating Azure connection')
      this._connection = new WebApi(
        currentServer()['base-url'],
        this.getAuthProvider()
      )
    }
    return this._connection
  }

  private getAuthProvider() {
    const user = currentUser()
    switch (user['auth-provider'].name) {
      case 'azure-devops-username':
        log.debug('Using Azure getBasicHandler')
        return getBasicHandler(
          user['auth-provider'].config.name!,
          user['auth-provider'].config.password!
        )
      case 'azure-devops-personal-access-token':
        log.debug('Using Azure getPersonalAccessTokenHandler')
        return getPersonalAccessTokenHandler(
          user['auth-provider'].config.token!
        )
      case 'azure-devops-bearer-token':
        log.debug('Using Azure getBearerHandler')
        return getBearerHandler(user['auth-provider'].config.token!)
      default:
        throw new Error(
          `Unhandled authentication provider ${user['auth-provider'].name}`
        )
    }
  }
}

const azureConnection = new AzureConnection()

export { AzureConnection, azureConnection }
