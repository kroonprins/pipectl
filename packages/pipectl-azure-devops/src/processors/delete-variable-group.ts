import { Action, ApplyArguments } from '@kroonprins/pipectl-core/dist/actions/model'
import { ActionProcessor, ProcessResult, TransformedDefinition } from '@kroonprins/pipectl-core/dist/model'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import { variableGroupApi } from '../adapters/variable-group-api'
import { AzureVariableGroup } from '../model/azure-variable-group'

class DeleteVariableGroup implements ActionProcessor {

  canProcess(transformedDefinition: TransformedDefinition, action: Action, _args: ApplyArguments): boolean {
    return transformedDefinition instanceof AzureVariableGroup && action === Action.DELETE
  }

  async process(azureVariableGroup: AzureVariableGroup, _action: Action, args: ApplyArguments): Promise<ProcessResult> {
    log.debug(`[DeleteVariableGroup] ${JSON.stringify(azureVariableGroup)}`)
    const variableGroup = azureVariableGroup.spec
    const project = azureVariableGroup.project
    const existingVariableGroup = await variableGroupApi.findVariableGroupByName(variableGroup.name!, project)
    if (existingVariableGroup) {
      if (args.dryRun) {
        return { info: `Variable group ${variableGroup.name} deletion skipped because dry run.` }
      } else {
        try {
          await variableGroupApi.deleteVariableGroup(existingVariableGroup.id!, project)
          return { info: `Successfully deleted variable group ${existingVariableGroup.id} (${existingVariableGroup.name})` }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      return { info: `Variable group ${variableGroup.name} not deleted because it does not exist.` }
    }
  }
}

export { DeleteVariableGroup }

