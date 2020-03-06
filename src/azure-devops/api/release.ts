import { KindProcessor } from "../../model/api";
import { Definition, Arguments } from "../../model";
import { findReleaseDefinitionByNameAndPath, createReleaseDefinition, updateReleaseDefinition, deleteReleaseDefinition } from "."
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

class ReleaseDefinitionProcessor implements KindProcessor {
    async apply(definition: Definition, args: Arguments) {
        const releaseDefinition = transform(definition)
        const existingReleaseDefinition = await findReleaseDefinitionByNameAndPath(<string>releaseDefinition.name, <string>releaseDefinition.path, <string>definition.metadata.project)
        if(existingReleaseDefinition) {
            console.log(`Updating existing release definition ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})`)
            releaseDefinition.id = existingReleaseDefinition.id
            releaseDefinition.revision = existingReleaseDefinition.revision
            return args.dryRun || updateReleaseDefinition(releaseDefinition, <string>definition.metadata.project)
        } else {
            console.log(`Creating release definition ${releaseDefinition.name}`)
            return args.dryRun || createReleaseDefinition(releaseDefinition, <string>definition.metadata.project)
        }
    }

    async delete(definition: Definition, args: Arguments) {
        const existingReleaseDefinition = await findReleaseDefinitionByNameAndPath(definition.metadata.name, <string>definition.spec.path, <string>definition.metadata.project)
        if(existingReleaseDefinition) {
            console.log(`Deleting release definition ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})`)
            return args.dryRun || deleteReleaseDefinition(<number>existingReleaseDefinition.id, <string>definition.metadata.project)
        } else {
            console.log(`Not deleting release definition ${definition.metadata.name} because it does not exist`)
        }
    }
}

const transform = (definition: Definition): ReleaseDefinition => {
    const releaseDefinition = definition.spec
    releaseDefinition.name = definition.metadata.name
    releaseDefinition.path = definition.metadata.path
    return releaseDefinition
}

export {
    ReleaseDefinitionProcessor
}