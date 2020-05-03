import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { buildApi } from '../adapters/build-api'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { toLabels } from '../util/tags'

class GetAllBuildDefinitions implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureBuildDefinition &&
      action === Action.GET &&
      !args.name
    )
  }

  async process(
    azureBuildDefinition: AzureBuildDefinition,
    _action: Action,
    _args: GetArguments
  ): Promise<ProcessResult> {
    log.debug(
      `[GetAllBuildDefinitions] ${JSON.stringify(azureBuildDefinition)}`
    )
    try {
      const project = azureBuildDefinition.project
      const buildDefinitions = await buildApi.findAllBuildDefinitions(project)
      if (buildDefinitions) {
        return {
          results: buildDefinitions.map((buildDefinition) => {
            return {
              apiVersion: azureBuildDefinition.apiVersion,
              kind: azureBuildDefinition.kind,
              metadata: {
                namespace: azureBuildDefinition.project,
                labels: toLabels(buildDefinition.tags),
              },
              spec: buildDefinition,
            }
          }),
          properties: { type: azureBuildDefinition.kind },
        }
      } else {
        return { results: [], properties: { type: azureBuildDefinition.kind } }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllBuildDefinitions }
