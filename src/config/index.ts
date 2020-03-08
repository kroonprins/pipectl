import { load } from 'js-yaml'
import { readFileSync } from 'fs'
import { Config, ContextConfig, UserConfig, ServerConfig } from '../model/config'

let config: Config

const initialize = () => {

    const location = getConfigFileLocation()

    config = load((readFileSync(location)).toString()) as Config // TODO sync?

    console.log(`Loaded configuration from ${location}`)
    console.log(` Current context ${config['current-context']}`)
    const defaultNamespace = getDefaultNamespace()
    if(defaultNamespace) {
        console.log(` Default namespace: ${defaultNamespace}`)
    }
    console.log(` Server type: ${getCurrentServer().type}`)
    console.log(` Base url: ${getCurrentServer()['base-url']}`)
    console.log(` Auth type: ${getCurrentUser()['auth-provider'].name}`)
}

const getConfigFileLocation = () => {
    return process.env.AZCONFIG || `${process.env.HOME}/.az/config`
}

const getCurrentContext = () => {
    return config.contexts
        .find(context => context.name === config['current-context']) as ContextConfig // TODO error handling not found
}

const getCurrentUser = () => {
    const currentUserRef = getCurrentContext().context.user
    return (config.users
        .find(user => user.name === currentUserRef) as UserConfig).user// TODO error handling not found

}

const getCurrentServer = () => {
    const currentServerRef = getCurrentContext().context.server
    return (config.servers
        .find(server => server.name === currentServerRef) as ServerConfig).server// TODO error handling not found
}

const getDefaultNamespace = () => {
    return getCurrentContext().context.namespace
}

export {
    config,
    initialize,
    getCurrentUser,
    getCurrentServer,
    getDefaultNamespace
}