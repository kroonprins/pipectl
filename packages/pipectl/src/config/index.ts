import { readFileSync } from 'fs'
import { load } from 'js-yaml'
import { log } from '../util/logging'
import { Config, ContextConfig, ServerConfig, UserConfig } from './model'

let config: Config

const initialize = (configFileLocation?: string) => {
  const location = getConfigFileLocation(configFileLocation)

  config = load(readFileSync(location).toString()) as Config // TODO sync?

  log.debug(`Loaded configuration from ${location}`)
  log.debug(` Current context ${config['current-context']}`)
  const namespace = defaultNamespace()
  if (namespace) {
    log.debug(` Default namespace: ${namespace}`)
  }
  log.debug(` Server type: ${currentServer().type}`)
  log.debug(` Base url: ${currentServer()['base-url']}`)
  log.debug(` Auth type: ${currentUser()['auth-provider'].name}`)
  log.debug()
  log.debug()
}

const getConfigFileLocation = (configFileLocation?: string) => {
  return (
    configFileLocation ||
    process.env.PIPECONFIG ||
    `${process.env.HOME}/.pipe/config`
  )
}

const currentContext = () => {
  return config.contexts.find(
    (context) => context.name === config['current-context']
  ) as ContextConfig // TODO error handling not found
}

const currentUser = () => {
  const currentUserRef = currentContext().context.user
  return (config.users.find(
    (user) => user.name === currentUserRef
  ) as UserConfig).user // TODO error handling not found
}

const currentServer = () => {
  const currentServerRef = currentContext().context.server
  return (config.servers.find(
    (server) => server.name === currentServerRef
  ) as ServerConfig).server // TODO error handling not found
}

const currentPlugins = () => {
  return currentContext().context.plugins || []
}

const defaultNamespace = () => currentContext().context.namespace

export {
  initialize,
  currentUser,
  currentServer,
  currentPlugins,
  defaultNamespace,
}
