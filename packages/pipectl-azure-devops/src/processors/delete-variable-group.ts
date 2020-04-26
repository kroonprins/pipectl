import { Action, ApplyArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { VariableGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { variableGroupApi } from '../adapters/variable-group-api'
import { AzureVariableGroup } from '../model/azure-variable-group'

class DeleteVariableGroup implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    _args: ApplyArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureVariableGroup &&
      action === Action.DELETE
    )
  }

  async process(
    azureVariableGroup: AzureVariableGroup,
    _action: Action,
    args: ApplyArguments
  ): Promise<ProcessResult> {
    log.debug(`[DeleteVariableGroup] ${JSON.stringify(azureVariableGroup)}`)
    const variableGroup = azureVariableGroup.spec
    const project = azureVariableGroup.project
    const id = variableGroup.id

    let existingVariableGroup: VariableGroup | null
    if (id) {
      existingVariableGroup = await variableGroupApi.findVariableGroupById(
        id,
        project
      )
    } else {
      existingVariableGroup = await variableGroupApi.findVariableGroupByName(
        variableGroup.name!,
        project
      )
    }
    if (existingVariableGroup) {
      if (args.dryRun) {
        return {
          info: `Variable group '${variableGroup.name}' deletion skipped because dry run.`,
        }
      } else {
        try {
          await variableGroupApi.deleteVariableGroup(
            existingVariableGroup.id!,
            project
          )
          return {
            info: `Successfully deleted variable group ${existingVariableGroup.id} (${existingVariableGroup.name})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      return {
        info: `Variable group '${variableGroup.name}' not deleted because it does not exist.`,
      }
    }
  }
}

export { DeleteVariableGroup }
