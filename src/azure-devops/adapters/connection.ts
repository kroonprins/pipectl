import { getBasicHandler, getHandlerFromToken, WebApi } from "azure-devops-node-api"
import { currentServer, currentUser } from "../../core/config"

class AzureConnection {
  private _connection: WebApi | null = null

  public get(): WebApi {
    if (!this._connection) {
      this._connection = new WebApi(currentServer()['base-url'], this.getAuthProvider())
    }
    return this._connection
  }

  private getAuthProvider() {
    const user = currentUser()
    switch (user['auth-provider'].name) {
      case 'azure-devops-username':
        // TODO prompt if not present?
        return getBasicHandler(user['auth-provider'].config.name!, user['auth-provider'].config.password!)
      case 'azure-devops-personal-access-token':
        return getHandlerFromToken(user['auth-provider'].config.token!)
      default:
        throw new Error(`Unhandled authentication provider ${user['auth-provider'].name}`)
    }
  }
}

const azureConnection = new AzureConnection()

export { AzureConnection, azureConnection }
