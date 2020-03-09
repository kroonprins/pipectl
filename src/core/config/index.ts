import { load } from 'js-yaml'
import { readFileSync } from 'fs'
import { Config, ContextConfig, UserConfig, ServerConfig } from './model'

let config: Config

const initialize = () => {

    const location = configFileLocation()

    config = load((readFileSync(location)).toString()) as Config // TODO sync?

    console.log(`Loaded configuration from ${location}`)
    console.log(` Current context ${config['current-context']}`)
    const namespace = defaultNamespace()
    if(namespace) {
        console.log(` Default namespace: ${namespace}`)
    }
    console.log(` Server type: ${currentServer().type}`)
    console.log(` Base url: ${currentServer()['base-url']}`)
    console.log(` Auth type: ${currentUser()['auth-provider'].name}`)
    console.log()
    console.log()
}

const configFileLocation = () => {
    return process.env.AZCONFIG || `${process.env.HOME}/.az/config`
}

const currentContext = () => {
    return config.contexts
        .find(context => context.name === config['current-context']) as ContextConfig // TODO error handling not found
}

const currentUser = () => {
    const currentUserRef = currentContext().context.user
    return (config.users
        .find(user => user.name === currentUserRef) as UserConfig).user// TODO error handling not found
}

const currentServer = () => {
    const currentServerRef = currentContext().context.server
    return (config.servers
        .find(server => server.name === currentServerRef) as ServerConfig).server// TODO error handling not found
}

const defaultNamespace = () => {
    return currentContext().context.namespace
}

export {
    initialize,
    currentUser,
    currentServer,
    defaultNamespace
}