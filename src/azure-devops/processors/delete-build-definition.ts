import { Action, ApplyArguments } from "../../core/actions/model"
import { ActionProcessor, ProcessResult, TransformedDefinition } from "../../core/model"
import { buildApi } from "../adapters/build-api"
import { AzureBuildDefinition } from "../model/azure-build-definition"

class DeleteBuildDefinition implements ActionProcessor {
  canProcess(transformedDefinition: TransformedDefinition, action: Action, _args: ApplyArguments): boolean {
    return transformedDefinition instanceof AzureBuildDefinition && action === Action.DELETE
  }
  async process(azureBuildDefinition: AzureBuildDefinition, _action: Action, args: ApplyArguments): Promise<ProcessResult> {
    const api = buildApi
    const buildDefinition = azureBuildDefinition.spec
    const project = azureBuildDefinition.project
    const existingBuildDefinition = await api.findBuildDefinitionByNameAndPath(buildDefinition.name!, buildDefinition.path!, project)
    if (existingBuildDefinition) {
      if (args.dryRun) {
        return { info: `Build definition ${buildDefinition.name} deletion skipped because dry run.` }
      }
      else {
        try {
          await api.deleteBuildDefinition(existingBuildDefinition.id!, project)
          return { info: `Successfully deleted build definition ${existingBuildDefinition.id} (${existingBuildDefinition.name})` }
        }
        catch (e) {
          return { error: e }
        }
      }
    }
    else {
      return { info: `Build definition ${buildDefinition.name} not deleted because it does not exist.` }
    }
  }
}

export { DeleteBuildDefinition }

