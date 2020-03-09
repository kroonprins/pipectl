import { ActionProcessor, TransformedDefinition, ProcessResult } from "../../core/model"
import { Action, ApplyArguments } from "../../core/actions/model"
import { releaseApi } from "../adapters/release-api"
import { AzureReleaseDefinition } from "../model/azure-release-definition"

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

export {
  ApplyReleaseDefinition,
}
