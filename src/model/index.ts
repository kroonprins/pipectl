import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"

interface Arguments {
    filename: string[],
    recursive: boolean,
    dryRun: boolean
    selector: string
}

interface Labels {
    [key: string]: string
}

interface MetaData {
    name: string
    path?: string
    project?: string
    labels: Labels
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
    Arguments,
    Definition,
    Resource
}

