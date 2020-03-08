import { getCurrentUser } from '../../config'
import { getBasicHandler } from "azure-devops-node-api"

const getAuthProvider = () => {
    const currentUser = getCurrentUser()
    switch(currentUser['auth-provider'].name) {
        case 'azure-devops-username':
            return getBasicHandler(currentUser['auth-provider'].config.name!, currentUser['auth-provider'].config.password!)
        default:
            throw new Error(`Unhandled authentication provider ${currentUser['auth-provider'].name}`)
    }
}

export {
    getAuthProvider
}