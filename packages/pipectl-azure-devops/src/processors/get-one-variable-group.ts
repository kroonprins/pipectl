import {
  Action,
  GetArguments,
} from '@kroonprins/pipectl-core/dist/actions/model'
import {
  ActionProcessor,
  TransformedDefinition,
} from '@kroonprins/pipectl-core/dist/model'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import { variableGroupApi } from '../adapters/variable-group-api'
import { AzureVariableGroup } from '../model/azure-variable-group'
import { GetVariableGroupProcessResult } from '../model/get-variable-group-process-result'

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
  ): Promise<GetVariableGroupProcessResult> {
    log.debug(`[GetOneVariableGroup] ${JSON.stringify(azureVariableGroup)}`)
    try {
      const project = azureVariableGroup.project
      const variableGroup = await variableGroupApi.findVariableGroupById(
        Number(args.name),
        project
      )
      if (variableGroup) {
        return new GetVariableGroupProcessResult([variableGroup])
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
