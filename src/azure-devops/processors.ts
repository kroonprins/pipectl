import { ActionProcessor, TransformedDefinition, ProcessResult } from "../core/model";
import { Action, ApplyArguments, GetArguments } from "../core/actions/model";
import { releaseApi } from "./adapters";
import { AzureReleaseDefinition, GetReleaseDefinitionProcessResult } from "./model";

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
            releaseDefinition.id = existingReleaseDefinition.id
            releaseDefinition.revision = existingReleaseDefinition.revision
            if (args.dryRun) {
                return { info: `Release definition ${releaseDefinition.name} update skipped because dry run.` }
            } else {
                try {
                    await api.updateReleaseDefinition(releaseDefinition, project)
                    return { info: `Successfully updated ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})` }
                } catch (e) {
                    return { error: e }
                }
            }
        } else {
            if (args.dryRun) {
                return { info: `Release definition ${releaseDefinition.name} creation skipped because dry run.` }
            } else {
                try {
                    const createdReleaseDefinition = await api.createReleaseDefinition(releaseDefinition, project)
                    return { info: `Successfully created ${createdReleaseDefinition.id} (${createdReleaseDefinition.name})` }
                } catch (e) {
                    return { error: e }
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
            if (args.dryRun) {
                return { info: `Release definition ${releaseDefinition.name} deletion skipped because dry run.` }
            } else {
                try {
                    await api.deleteReleaseDefinition(existingReleaseDefinition.id!, project)
                    return { info: `Successfully deleted ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})` }
                } catch (e) {
                    return { error: e }
                }
            }
        } else {
            return { info: `Release definition ${releaseDefinition.name} not deleted because it does not exist.` }
        }
    }
}

class GetAllReleaseDefinitions implements ActionProcessor {

    canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
        return transformedDefinition instanceof AzureReleaseDefinition && action === Action.GET && !args.name
    }

    async process(azureReleaseDefinition: AzureReleaseDefinition, action: Action, args: GetArguments): Promise<GetReleaseDefinitionProcessResult> {
        const api = releaseApi
        const project = azureReleaseDefinition.project

        try {
            const releaseDefinitions = await api.findAllReleaseDefinitions(project)
            if(releaseDefinitions) {
                return new GetReleaseDefinitionProcessResult(releaseDefinitions)
            } else {
                return { releaseDefinitions: [] }
            }
        } catch (e) {
            return { error: e }
        }
    }
}

class GetOneReleaseDefinition implements ActionProcessor {

    canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
        return transformedDefinition instanceof AzureReleaseDefinition && action === Action.GET && !!args.name
    }

    async process(azureReleaseDefinition: AzureReleaseDefinition, action: Action, args: GetArguments): Promise<GetReleaseDefinitionProcessResult> {
        const api = releaseApi
        const project = azureReleaseDefinition.project

        try {
            const releaseDefinition = await api.findReleaseDefinitionById(Number(args.name), project)
            if (releaseDefinition) {
                return new GetReleaseDefinitionProcessResult([ releaseDefinition ])
            } else {
                return { error: new Error(`Release definition '${args.name}' does not exist in project '${project}'.`) }
            }
        } catch (e) {
            return { error: e }
        }
    }
}

export {
    ApplyReleaseDefinition,
    DeleteReleaseDefinition,
    GetAllReleaseDefinitions,
    GetOneReleaseDefinition,
}