import { Action, GetArguments } from 'pipectl-core/dist/actions/model'
import { ActionProcessor, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { variableGroupApi } from '../adapters/variable-group-api'
import { AzureVariableGroup } from '../model/azure-variable-group'
import { GetVariableGroupProcessResult } from '../model/get-variable-group-process-result'

class GetAllVariableGroups implements ActionProcessor {

  canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
    return transformedDefinition instanceof AzureVariableGroup && action === Action.GET && !args.name
  }

  async process(azureVariableGroup: AzureVariableGroup, _action: Action, _args: GetArguments): Promise<GetVariableGroupProcessResult> {
    log.debug(`[GetAllVariableGroups] ${JSON.stringify(azureVariableGroup)}`)
    try {
      const project = azureVariableGroup.project
      const variableGroups = await variableGroupApi.findAllVariableGroups(project)
      if (variableGroups) {
        return new GetVariableGroupProcessResult(variableGroups)
      } else {
        return new GetVariableGroupProcessResult([])
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllVariableGroups }

