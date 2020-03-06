import { getCurrentUser } from '../../auth'
import { getBasicHandler } from "azure-devops-node-api"

const getAuthProvider = () => {
    const currentUser = getCurrentUser()
    switch(currentUser['auth-provider'].name) {
        case 'azure-devops-username':
            return getBasicHandler(<string>currentUser['auth-provider'].config.name, <string>currentUser['auth-provider'].config.password)
        default:
            throw new Error(`Unhandled authentication provider ${currentUser['auth-provider'].name}`)
    }
}

export {
    getAuthProvider
}