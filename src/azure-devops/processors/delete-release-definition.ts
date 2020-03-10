import { Action, ApplyArguments } from "../../core/actions/model"
import { ActionProcessor, ProcessResult, TransformedDefinition } from "../../core/model"
import { releaseApi } from "../adapters/release-api"
import { AzureReleaseDefinition } from "../model/azure-release-definition"

class DeleteReleaseDefinition implements ActionProcessor {
  canProcess(transformedDefinition: TransformedDefinition, action: Action, _args: ApplyArguments): boolean {
    return transformedDefinition instanceof AzureReleaseDefinition && action === Action.DELETE
  }
  async process(azureReleaseDefinition: AzureReleaseDefinition, _action: Action, args: ApplyArguments): Promise<ProcessResult> {
    const api = releaseApi
    const releaseDefinition = azureReleaseDefinition.spec
    const project = azureReleaseDefinition.project
    const existingReleaseDefinition = await api.findReleaseDefinitionByNameAndPath(releaseDefinition.name!, releaseDefinition.path!, project)
    if (existingReleaseDefinition) {
      if (args.dryRun) {
        return { info: `Release definition ${releaseDefinition.name} deletion skipped because dry run.` }
      }
      else {
        try {
          await api.deleteReleaseDefinition(existingReleaseDefinition.id!, project)
          return { info: `Successfully deleted release definition ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})` }
        }
        catch (e) {
          return { error: e }
        }
      }
    }
    else {
      return { info: `Release definition ${releaseDefinition.name} not deleted because it does not exist.` }
    }
  }
}

export { DeleteReleaseDefinition }

