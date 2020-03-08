import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"

interface CommonArguments {
    filename?: string[]
    recursive?: boolean,
    selector?: string,
    namespace?: string  
}

interface ApplyArguments extends CommonArguments  {
    filename: string[],
    dryRun?: boolean
}

interface GetArguments extends CommonArguments  {
    kind: string,
    name?: string // number for azure devops
}

interface Labels {
    [key: string]: string
}

interface MetaData {
    namespace?: string
    labels?: Labels // TODO add them also as tags in azure devops?
    // TODO annotations?
}

interface Definition extends Resource {
    metadata: MetaData
    spec: ReleaseDefinition // TODO generics or something
}

interface Resource {
    apiVersion: string
    kind: string
}

export {
    CommonArguments,
    ApplyArguments,
    GetArguments,
    Definition,
    Resource
}

