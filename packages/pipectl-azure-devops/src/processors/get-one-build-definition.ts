import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { buildApi } from '../adapters/build-api'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { toLabels } from '../reporters/util/tags'

class GetOneBuildDefinition implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureBuildDefinition &&
      action === Action.GET &&
      !!args.name
    )
  }

  async process(
    azureBuildDefinition: AzureBuildDefinition,
    _action: Action,
    args: GetArguments
  ): Promise<ProcessResult> {
    log.debug(`[GetOneBuildDefinition] ${JSON.stringify(azureBuildDefinition)}`)
    try {
      const project = azureBuildDefinition.project
      const buildDefinition = await buildApi.findBuildDefinitionById(
        Number(args.name),
        project
      )
      if (buildDefinition) {
        return {
          results: [
            {
              apiVersion: azureBuildDefinition.apiVersion,
              kind: azureBuildDefinition.kind,
              metadata: {
                namespace: azureBuildDefinition.project,
                labels: toLabels(buildDefinition.tags),
              },
              spec: buildDefinition,
            },
          ],
          properties: { type: azureBuildDefinition.kind },
        }
      } else {
        return {
          error: new Error(
            `Build definition '${args.name}' does not exist in project '${project}'.`
          ),
        }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetOneBuildDefinition }
