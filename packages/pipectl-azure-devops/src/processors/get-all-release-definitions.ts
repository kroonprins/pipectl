import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { releaseApi } from '../adapters/release-api'
import { AzureReleaseDefinition } from '../model/azure-release-definition'
import { toLabels } from '../reporters/util/tags'

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
  ): Promise<ProcessResult> {
    log.debug(
      `[GetAllReleaseDefinitions] ${JSON.stringify(azureReleaseDefinition)}`
    )
    try {
      const project = azureReleaseDefinition.project
      const releaseDefinitions = await releaseApi.findAllReleaseDefinitions(
        project
      )
      if (releaseDefinitions) {
        return {
          results: releaseDefinitions.map((releaseDefinition) => {
            return {
              apiVersion: azureReleaseDefinition.apiVersion,
              kind: azureReleaseDefinition.kind,
              metadata: {
                namespace: azureReleaseDefinition.project,
                labels: toLabels(releaseDefinition.tags),
              },
              spec: releaseDefinition,
            }
          }),
          properties: { type: azureReleaseDefinition.kind },
        }
      } else {
        return {
          results: [],
          properties: { type: azureReleaseDefinition.kind },
        }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllReleaseDefinitions }
