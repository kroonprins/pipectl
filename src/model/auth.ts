import { Resource } from '../model'

interface Server {
    'base-url': string
}

interface ServerConfig {
    server: Server
    name: string
}

interface Context {
    server: string
    user: string
}

interface ContextConfig {
    context: Context
    name: string
}

interface AuthProvider {
    name?: string
    password?: string
    token?: string
}

interface AuthProviderConfig {
    config: AuthProvider
    name: string
}

interface User {
    'auth-provider': AuthProviderConfig
}

interface UserConfig {
    user: User
    name: string
}

interface AuthConfig extends Resource {
    servers: ServerConfig[]
    contexts: ContextConfig[]
    'current-context': string
    users: UserConfig[]
}

export {
    AuthConfig,
    ContextConfig,
    UserConfig,
    ServerConfig
}