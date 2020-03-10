import { ActionProcessor, TransformedDefinition, ProcessResult } from "../../core/model"
import { Action, ApplyArguments } from "../../core/actions/model"
import { AzureBuildDefinition } from "../model/azure-build-definition"
import { buildApi } from "../adapters/build-api"

class ApplyBuildDefinition implements ActionProcessor {

  canProcess(transformedDefinition: TransformedDefinition, action: Action, args: ApplyArguments): boolean {
    return transformedDefinition instanceof AzureBuildDefinition && action === Action.APPLY
  }

  async process(azureBuildDefinition: AzureBuildDefinition, action: Action, args: ApplyArguments): Promise<ProcessResult> {
    const api = buildApi
    const buildDefinition = azureBuildDefinition.spec
    const project = azureBuildDefinition.project

    const existingBuildDefinition = await api.findBuildDefinitionByNameAndPath(buildDefinition.name!, buildDefinition.path!, project)
    if (existingBuildDefinition) {
      buildDefinition.id = existingBuildDefinition.id
      buildDefinition.revision = existingBuildDefinition.revision
      if (args.dryRun) {
        return { info: `Build definition ${buildDefinition.name} update skipped because dry run.` }
      } else {
        try {
          await api.updateBuildDefinition(buildDefinition, project)
          return { info: `Successfully updated build definition ${existingBuildDefinition.id} (${existingBuildDefinition.name})` }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      if (args.dryRun) {
        return { info: `Build definition ${buildDefinition.name} creation skipped because dry run.` }
      } else {
        try {
          const createdBuildDefinition = await api.createBuildDefinition(buildDefinition, project)
          return { info: `Successfully created build definition ${createdBuildDefinition.id} (${createdBuildDefinition.name})` }
        } catch (e) {
          return { error: e }
        }
      }
    }
  }
}

export {
  ApplyBuildDefinition,
}
