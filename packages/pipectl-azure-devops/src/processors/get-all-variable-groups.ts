import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { variableGroupApi } from '../adapters/variable-group-api'
import { AzureVariableGroup } from '../model/azure-variable-group'

class GetAllVariableGroups implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureVariableGroup &&
      action === Action.GET &&
      !args.name
    )
  }

  async process(
    azureVariableGroup: AzureVariableGroup,
    _action: Action,
    _args: GetArguments
  ): Promise<ProcessResult> {
    log.debug(`[GetAllVariableGroups] ${JSON.stringify(azureVariableGroup)}`)
    try {
      const project = azureVariableGroup.project
      const variableGroups = await variableGroupApi.findAllVariableGroups(
        project
      )
      if (variableGroups) {
        return {
          results: variableGroups.map((variableGroup) => {
            return {
              apiVersion: azureVariableGroup.apiVersion,
              kind: azureVariableGroup.kind,
              metadata: {
                namespace: azureVariableGroup.project,
                labels: {},
              },
              spec: variableGroup,
            }
          }),
          properties: { type: azureVariableGroup.kind },
        }
      } else {
        return { results: [], properties: { type: azureVariableGroup.kind } }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllVariableGroups }
