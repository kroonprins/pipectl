import { KindProcessor, GetResult } from "../../model/api";
import { Definition, ApplyArguments, GetArguments } from "../../model";
import { findReleaseDefinitionByNameAndPath, createReleaseDefinition, updateReleaseDefinition, deleteReleaseDefinition, findReleaseDefinitionById } from "."
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { getDefaultNamespace } from "../../config"

class ReleaseDefinitionProcessor implements KindProcessor {
    async apply(definition: Definition, args: ApplyArguments) {
        const releaseDefinition = transform(definition)
        const existingReleaseDefinition = await findReleaseDefinitionByNameAndPath(releaseDefinition.name!, releaseDefinition.path!, project(args, definition))
        if (existingReleaseDefinition) {
            console.log(`Updating existing release definition ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})`)
            releaseDefinition.id = existingReleaseDefinition.id
            releaseDefinition.revision = existingReleaseDefinition.revision
            return args.dryRun || updateReleaseDefinition(releaseDefinition, project(args, definition))
        } else {
            console.log(`Creating release definition ${releaseDefinition.name}`)
            return args.dryRun || createReleaseDefinition(releaseDefinition, project(args, definition))
        }
    }

    async delete(definition: Definition, args: ApplyArguments) {
        const existingReleaseDefinition = await findReleaseDefinitionByNameAndPath(definition.spec.name!, definition.spec.path!, project(args, definition))
        if (existingReleaseDefinition) {
            console.log(`Deleting release definition ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})`)
            return args.dryRun || deleteReleaseDefinition(existingReleaseDefinition.id!, project(args, definition))
        } else {
            console.log(`Not deleting release definition ${definition.spec.name} because it does not exist`)
        }
    }

    async get(args: GetArguments) {
        if(args.name) {
            const releaseDefinition: ReleaseDefinition = await findReleaseDefinitionById(Number(args.name), project(args))
            return [ toGetResult(releaseDefinition) ]
        }
        return Promise.resolve([{name: "xy", description: "yo"}])
    }
}

const transform = (definition: Definition): ReleaseDefinition => { // TODO move
    const releaseDefinition = definition.spec
    // releaseDefinition.name = definition.metadata.name
    // releaseDefinition.path = definition.metadata.path
    return releaseDefinition
}

const toGetResult = (releaseDefinition: ReleaseDefinition): GetResult => { // TODO move
    return {
        name: (releaseDefinition.id!).toString(),
        description: `${releaseDefinition.path}\\${releaseDefinition.name}`
    }
}

const project = (args: ApplyArguments | GetArguments, definition?: Definition): string => {
    if (definition && definition.metadata.namespace) {
        return definition.metadata.namespace
    }
    if (args.namespace) {
        return args.namespace
    }
    const defaultNamespace = getDefaultNamespace()
    if (defaultNamespace) {
        return defaultNamespace
    }
    throw new Error('Can not determine the namespace.') // TODO global fallback "default" ?
}

export {
    ReleaseDefinitionProcessor
}