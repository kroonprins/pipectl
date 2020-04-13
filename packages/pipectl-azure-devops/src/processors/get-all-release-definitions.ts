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

class GetAllReleaseDefinitions implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureReleaseDefinition &&
      action === Action.GET &&
      !args.name
    )
  }

  async process(
    azureReleaseDefinition: AzureReleaseDefinition,
    _action: Action,
    _args: GetArguments
  ): Promise<GetReleaseDefinitionProcessResult> {
    log.debug(
      `[GetAllReleaseDefinitions] ${JSON.stringify(azureReleaseDefinition)}`
    )
    try {
      const project = azureReleaseDefinition.project
      const releaseDefinitions = await releaseApi.findAllReleaseDefinitions(
        project
      )
      if (releaseDefinitions) {
        return new GetReleaseDefinitionProcessResult(releaseDefinitions)
      } else {
        return new GetReleaseDefinitionProcessResult([])
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllReleaseDefinitions }
