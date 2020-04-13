import { Action, ApplyArguments } from '@kroonprins/pipectl-core/dist/actions/model'
import { ActionProcessor, ProcessResult, TransformedDefinition } from '@kroonprins/pipectl-core/dist/model'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import { buildApi } from '../adapters/build-api'
import { AzureBuildDefinition } from '../model/azure-build-definition'

class ApplyBuildDefinition implements ActionProcessor {

  canProcess(transformedDefinition: TransformedDefinition, action: Action, _args: ApplyArguments): boolean {
    return transformedDefinition instanceof AzureBuildDefinition && action === Action.APPLY
  }

  async process(azureBuildDefinition: AzureBuildDefinition, _action: Action, args: ApplyArguments): Promise<ProcessResult> {
    log.debug(`[ApplyBuildDefinition] ${JSON.stringify(azureBuildDefinition)}`)
    const buildDefinition = azureBuildDefinition.spec
    const project = azureBuildDefinition.project

    const existingBuildDefinition = await buildApi.findBuildDefinitionByNameAndPath(buildDefinition.name!, buildDefinition.path!, project)
    if (existingBuildDefinition) {
      buildDefinition.id = existingBuildDefinition.id
      buildDefinition.revision = existingBuildDefinition.revision
      if (args.dryRun) {
        return { info: `Build definition ${buildDefinition.name} update skipped because dry run.` }
      } else {
        try {
          await buildApi.updateBuildDefinition(buildDefinition, project)
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
          const createdBuildDefinition = await buildApi.createBuildDefinition(buildDefinition, project)
          return { info: `Successfully created build definition ${createdBuildDefinition.id} (${createdBuildDefinition.name})` }
        } catch (e) {
          return { error: e }
        }
      }
    }
  }
}

export { ApplyBuildDefinition }

