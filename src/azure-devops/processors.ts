import { ActionProcessor, TransformedDefinition, ProcessResult } from "../core/model";
import { Action, ApplyArguments, GetArguments } from "../core/actions/model";
import { releaseApi } from "./adapters";
import { AzureReleaseDefinition } from "./model";

class ApplyReleaseDefinition implements ActionProcessor {

    canProcess(transformedDefinition: TransformedDefinition, action: Action, args: ApplyArguments): boolean {
        return transformedDefinition instanceof AzureReleaseDefinition && action === Action.APPLY
    }

    async process(azureReleaseDefinition: AzureReleaseDefinition, action: Action, args: ApplyArguments): Promise<ProcessResult> {
        const api = releaseApi
        const releaseDefinition = azureReleaseDefinition.spec
        const project = azureReleaseDefinition.project

        const existingReleaseDefinition = await api.findReleaseDefinitionByNameAndPath(releaseDefinition.name!, releaseDefinition.path!, project)
        if (existingReleaseDefinition) {
            console.log(`Updating existing release definition ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})`)
            releaseDefinition.id = existingReleaseDefinition.id
            releaseDefinition.revision = existingReleaseDefinition.revision
            if (args.dryRun) {
                console.log('Skipping update (dry run)')
                return { message: 'Update skipped (dry run)' }
            } else {
                try {
                    await api.updateReleaseDefinition(releaseDefinition, project)
                    return { message: `Successfully updated ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})` }
                } catch (e) {
                    console.log(e)
                    return { message: e.message }
                }
            }
        } else {
            console.log(`Creating release definition ${releaseDefinition.name}`)
            if (args.dryRun) {
                console.log('Skipping create (dry run)')
                return { message: 'Update skipped (dry run)' }
            } else {
                try {
                    const createdReleaseDefinition = await api.createReleaseDefinition(releaseDefinition, project)
                    return { message: `Successfully created ${createdReleaseDefinition.id} (${createdReleaseDefinition.name})` }
                } catch (e) {
                    console.log(e)
                    return { message: e.message }
                }
            }
        }
    }
}

class DeleteReleaseDefinition implements ActionProcessor {

    canProcess(transformedDefinition: TransformedDefinition, action: Action, args: ApplyArguments): boolean {
        return transformedDefinition instanceof AzureReleaseDefinition && action === Action.DELETE
    }

    async process(azureReleaseDefinition: AzureReleaseDefinition, action: Action, args: ApplyArguments): Promise<ProcessResult> {
        const api = releaseApi
        const releaseDefinition = azureReleaseDefinition.spec
        const project = azureReleaseDefinition.project

        const existingReleaseDefinition = await api.findReleaseDefinitionByNameAndPath(releaseDefinition.name!, releaseDefinition.path!, project)
        if (existingReleaseDefinition) {
            console.log(`Deleting release definition ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})`)

            if (args.dryRun) {
                console.log('Skipping delete (dry run)')
                return { message: 'Delete skipped (dry run)' }
            } else {
                try {
                    await api.deleteReleaseDefinition(existingReleaseDefinition.id!, project)
                    return { message: `Successfully deleted ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})` }
                } catch (e) {
                    console.log(e)
                    return { message: e.message }
                }
            }
        } else {
            console.log(`Not deleting release definition ${releaseDefinition.name} because it does not exist`)
            return { message: 'Delete skipped (doesn\'t exist)' }
        }
    }
}

class GetAllReleaseDefinitions implements ActionProcessor {

    canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
        return transformedDefinition instanceof AzureReleaseDefinition && action === Action.GET && !args.name
    }

    async process(azureReleaseDefinition: AzureReleaseDefinition, action: Action, args: GetArguments): Promise<ProcessResult> {
        const api = releaseApi
        const project = azureReleaseDefinition.project
        console.log('Retrieving release definitions')

        try {
            const releaseDefinitions = await api.findAllReleaseDefinitions(project)
            if(releaseDefinitions) {
                return { message: releaseDefinitions.reduce<string>(
                    (acc, value) => { return acc + `${value.path}\\${value.name}\n` }, "") }
            } else {
                return { message: 'Nothing found' }
            }
        } catch (e) {
            console.log(e)
            return { message: e.message }
        }
    }
}

class GetOneReleaseDefinition implements ActionProcessor {

    canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
        return transformedDefinition instanceof AzureReleaseDefinition && action === Action.GET && !!args.name
    }

    async process(azureReleaseDefinition: AzureReleaseDefinition, action: Action, args: GetArguments): Promise<ProcessResult> {
        const api = releaseApi
        const project = azureReleaseDefinition.project
        console.log(`Retrieving release definition ${args.name}`)

        try {
            const releaseDefinition = await api.findReleaseDefinitionById(Number(args.name), project)
            if (releaseDefinition) {
                return { message: `${releaseDefinition.path}\\${releaseDefinition.name}` }
            } else {
                return { message: "Not found" }
            }
        } catch (e) {
            console.log(e)
            return { message: e.message }
        }
    }
}

export {
    ApplyReleaseDefinition,
    DeleteReleaseDefinition,
    GetAllReleaseDefinitions,
    GetOneReleaseDefinition,
}