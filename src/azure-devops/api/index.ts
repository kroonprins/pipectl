import { Api, KindProcessor } from "../../model/api"
import { Definition, ApplyArguments, GetArguments } from "../../model"
import { ReleaseDefinitionProcessor } from "./release"
import { WebApi } from "azure-devops-node-api"
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { getAuthProvider } from "../auth"
import { getCurrentServer } from "../../config"

const KIND_MAPPING: { [key: string]: KindProcessor } = {
    'ReleaseDefinition': new ReleaseDefinitionProcessor()
}

let connection: WebApi
const getConnection = () => {
    if(connection) return connection
    connection = new WebApi(getCurrentServer()['base-url'], getAuthProvider())
    return connection
}

const getReleaseApi = async () => {
    return getConnection().getReleaseApi() // TODO memoize
}

const findReleaseDefinitionByNameAndPath = async (name: string, path: string, project: string): Promise<ReleaseDefinition | null> => {
    const releaseApi = await getReleaseApi()
    const search = await releaseApi.getReleaseDefinitions(project, name, undefined, undefined, undefined, 1, undefined, undefined, path, true, undefined, ['id', 'revision'], undefined, undefined, undefined)
    if (search && search.length) {
        return search[0]
    }
    return null
}

const findReleaseDefinitionById = async (id: number, project: string) => {
    const releaseApi = await getReleaseApi()
    return releaseApi.getReleaseDefinition(project, id, ['id', 'name', 'path'])
}

const createReleaseDefinition = async (releaseDefinition: ReleaseDefinition, project: string) => {
    const releaseApi = await getReleaseApi()
    return releaseApi.createReleaseDefinition(releaseDefinition, project)
}

const updateReleaseDefinition = async (releaseDefinition: ReleaseDefinition, project: string) => {
    const releaseApi = await getReleaseApi()
    return releaseApi.updateReleaseDefinition(releaseDefinition, project)
}

const deleteReleaseDefinition = async (releaseDefinitionId: number, project: string) => {
    const releaseApi = await getReleaseApi()
    return releaseApi.deleteReleaseDefinition(project, releaseDefinitionId)
}

class AzureDevOpsApi implements Api {
    apply(definition: Definition, args: ApplyArguments) {
        return getKindProcessor(definition.kind).apply(definition, args)
    }
    delete(definition: Definition, args: ApplyArguments) {
        return getKindProcessor(definition.kind).delete(definition, args)
    }
    get(args: GetArguments) {
        return getKindProcessor(args.kind).get(args)
    }
}

const getKindProcessor = (kind: string) => {
    const mapped = KIND_MAPPING[kind]
    if(!mapped) {
        throw new Error(`Unsupported kind '${kind}'`)
    }
    return mapped
}

export {
    AzureDevOpsApi,
    getReleaseApi,
    findReleaseDefinitionByNameAndPath,
    findReleaseDefinitionById,
    createReleaseDefinition,
    updateReleaseDefinition,
    deleteReleaseDefinition
}