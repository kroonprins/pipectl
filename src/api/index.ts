import { Api } from "../model/api"
import { AzureDevOpsApi } from '../azure-devops/api'
import { getCurrentServer } from "../config"

const API_MAPPING: { [key: string]: Api } = {
    'azure-devops': new AzureDevOpsApi()
}

const getApi = (): Api => {
    const apiType = getCurrentServer().type
    const api = API_MAPPING[apiType]
    if (!api) {
        throw new Error(`Unsupported apiVersion ${apiType}`)
    }
    return api
}

export {
    getApi
}