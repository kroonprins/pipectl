import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { variableGroupApi } from '../adapters/variable-group-api'
import { AzureVariableGroup } from '../model/azure-variable-group'

class GetOneVariableGroup implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureVariableGroup &&
      action === Action.GET &&
      !!args.name
    )
  }

  async process(
    azureVariableGroup: AzureVariableGroup,
    _action: Action,
    args: GetArguments
  ): Promise<ProcessResult> {
    log.debug(`[GetOneVariableGroup] ${JSON.stringify(azureVariableGroup)}`)
    try {
      const project = azureVariableGroup.project
      const variableGroup = await variableGroupApi.findVariableGroupById(
        Number(args.name),
        project
      )
      if (variableGroup) {
        return {
          results: [
            {
              apiVersion: azureVariableGroup.apiVersion,
              kind: azureVariableGroup.kind,
              metadata: {
                namespace: azureVariableGroup.project,
                labels: {},
              },
              spec: variableGroup,
            },
          ],
          properties: { type: azureVariableGroup.kind },
        }
      } else {
        return {
          error: new Error(
            `Variable group '${args.name}' does not exist in project '${project}'.`
          ),
        }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetOneVariableGroup }
