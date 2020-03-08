const API_VERSION = 'azure-devops'

const isAzureDevOps = (apiVersion: string): boolean => {
    return apiVersion === API_VERSION || apiVersion.startsWith(`${API_VERSION}/`)
}

export {
    isAzureDevOps
}