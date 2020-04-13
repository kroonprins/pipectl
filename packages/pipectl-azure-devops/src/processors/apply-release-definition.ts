import { Action, ApplyArguments } from '@kroonprins/pipectl-core/dist/actions/model'
import { ActionProcessor, ProcessResult, TransformedDefinition } from '@kroonprins/pipectl-core/dist/model'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import { releaseApi } from '../adapters/release-api'
import { AzureReleaseDefinition } from '../model/azure-release-definition'

class ApplyReleaseDefinition implements ActionProcessor {

  canProcess(transformedDefinition: TransformedDefinition, action: Action, _args: ApplyArguments): boolean {
    return transformedDefinition instanceof AzureReleaseDefinition && action === Action.APPLY
  }

  async process(azureReleaseDefinition: AzureReleaseDefinition, _action: Action, args: ApplyArguments): Promise<ProcessResult> {
    log.debug(`[ApplyReleaseDefinition] ${JSON.stringify(azureReleaseDefinition)}`)
    const releaseDefinition = azureReleaseDefinition.spec
    const project = azureReleaseDefinition.project

    const existingReleaseDefinition = await releaseApi.findReleaseDefinitionByNameAndPath(releaseDefinition.name!, releaseDefinition.path!, project)
    if (existingReleaseDefinition) {
      releaseDefinition.id = existingReleaseDefinition.id
      releaseDefinition.revision = existingReleaseDefinition.revision
      if (args.dryRun) {
        return { info: `Release definition ${releaseDefinition.name} update skipped because dry run.` }
      } else {
        try {
          await releaseApi.updateReleaseDefinition(releaseDefinition, project)
          return { info: `Successfully updated release definition ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})` }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      if (args.dryRun) {
        return { info: `Release definition ${releaseDefinition.name} creation skipped because dry run.` }
      } else {
        try {
          const createdReleaseDefinition = await releaseApi.createReleaseDefinition(releaseDefinition, project)
          return { info: `Successfully created release definition ${createdReleaseDefinition.id} (${createdReleaseDefinition.name})` }
        } catch (e) {
          return { error: e }
        }
      }
    }
  }
}

export { ApplyReleaseDefinition }

