import * as yaml from 'js-yaml'
import { readFileSync } from 'fs'
import { AuthConfig, ContextConfig, UserConfig, ServerConfig } from '../model/auth'

let authConfig: AuthConfig

const initialize = () => {

    const location = getConfigFileLocation()

    authConfig = yaml.load((readFileSync(location)).toString()) as AuthConfig // TODO sync?

    console.log(`Loaded configuration from ${location}`)
    console.log(` Current context ${authConfig['current-context']}`)
    console.log(` Base url: ${getCurrentServer()['base-url']}`)
    console.log(` Auth type: ${getCurrentUser()['auth-provider'].name}`)
}

const getConfigFileLocation = () => {
    return process.env.AZCONFIG || `${process.env.HOME}/.az/config`
}

const getCurrentContext = () => {
    return authConfig.contexts
        .find(context => context.name === authConfig['current-context']) as ContextConfig // TODO error handling not found
}

const getCurrentUser = () => {
    const currentUserRef = getCurrentContext().context.user
    return (authConfig.users
        .find(user => user.name === currentUserRef) as UserConfig).user// TODO error handling not found

}

const getCurrentServer = () => {
    const currentServerRef = getCurrentContext().context.server
    return (authConfig.servers
        .find(server => server.name === currentServerRef) as ServerConfig).server// TODO error handling not found

}

export {
    authConfig,
    initialize,
    getCurrentUser,
    getCurrentServer
}