import {
  Action,
  GetArguments,
} from '@kroonprins/pipectl-core/dist/actions/model'
import {
  ActionProcessor,
  TransformedDefinition,
} from '@kroonprins/pipectl-core/dist/model'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import { releaseApi } from '../adapters/release-api'
import { AzureReleaseDefinition } from '../model/azure-release-definition'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'

class GetOneReleaseDefinition implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureReleaseDefinition &&
      action === Action.GET &&
      !!args.name
    )
  }

  async process(
    azureReleaseDefinition: AzureReleaseDefinition,
    _action: Action,
    args: GetArguments
  ): Promise<GetReleaseDefinitionProcessResult> {
    log.debug(
      `[GetOneReleaseDefinition] ${JSON.stringify(azureReleaseDefinition)}`
    )
    try {
      const project = azureReleaseDefinition.project
      const releaseDefinition = await releaseApi.findReleaseDefinitionById(
        Number(args.name),
        project
      )
      if (releaseDefinition) {
        return new GetReleaseDefinitionProcessResult([releaseDefinition])
      } else {
        return {
          error: new Error(
            `Release definition '${args.name}' does not exist in project '${project}'.`
          ),
        }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetOneReleaseDefinition }
