import { Action, ApplyArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { releaseApi } from '../adapters/release-api'
import { AzureReleaseDefinition } from '../model/azure-release-definition'

class DeleteReleaseDefinition implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    _args: ApplyArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureReleaseDefinition &&
      action === Action.DELETE
    )
  }

  async process(
    azureReleaseDefinition: AzureReleaseDefinition,
    _action: Action,
    args: ApplyArguments
  ): Promise<ProcessResult> {
    log.debug(
      `[DeleteReleaseDefinition] ${JSON.stringify(azureReleaseDefinition)}`
    )
    const releaseDefinition = azureReleaseDefinition.spec
    const project = azureReleaseDefinition.project
    const id = releaseDefinition.id

    let existingReleaseDefinition: ReleaseDefinition | null
    if (id) {
      existingReleaseDefinition = await releaseApi.findReleaseDefinitionById(
        id,
        project
      )
    } else {
      existingReleaseDefinition = await releaseApi.findReleaseDefinitionByNameAndPath(
        releaseDefinition.name!,
        releaseDefinition.path!,
        project
      )
    }
    if (existingReleaseDefinition) {
      if (args.dryRun) {
        return {
          info: `Release definition '${releaseDefinition.name}' deletion skipped because dry run.`,
        }
      } else {
        try {
          await releaseApi.deleteReleaseDefinition(
            existingReleaseDefinition.id!,
            project
          )
          return {
            info: `Successfully deleted release definition ${existingReleaseDefinition.id} (${existingReleaseDefinition.name})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      return {
        info: `Release definition '${releaseDefinition.name}' not deleted because it does not exist.`,
      }
    }
  }
}

export { DeleteReleaseDefinition }
