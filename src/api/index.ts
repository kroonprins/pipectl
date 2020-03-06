import { Definition } from "../model"
import { Api } from "../model/api"
import { AzureDevOpsApi } from '../azure-devops/api'

const API_MAPPING: { [key: string]: Api } = {
    'azure-devops': new AzureDevOpsApi()
}

const getApi = (definition: Definition): Api => {
    const apiType = getApiType(definition.apiVersion)
    const api = API_MAPPING[apiType]
    if (!api) {
        throw new Error(`Unsupported apiVersion ${definition.apiVersion}`)
    }
    return api
}

const getApiType = (apiVersion: string) => {
    return apiVersion.split('/')[0]
}

export {
    getApi
}