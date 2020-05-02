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
  ): Promise<ProcessResult> {
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
        return {
          results: [
            {
              apiVersion: azureReleaseDefinition.apiVersion,
              kind: azureReleaseDefinition.kind,
              metadata: {
                namespace: azureReleaseDefinition.project,
                labels: toLabels(releaseDefinition.tags),
              },
              spec: releaseDefinition,
            },
          ],
          properties: { type: azureReleaseDefinition.kind },
        }
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
