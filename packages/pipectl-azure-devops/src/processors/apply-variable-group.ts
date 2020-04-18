import { Action, ApplyArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { variableGroupApi } from '../adapters/variable-group-api'
import { AzureVariableGroup } from '../model/azure-variable-group'
import { VariableGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'

class ApplyVariableGroup implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    _args: ApplyArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureVariableGroup &&
      action === Action.APPLY
    )
  }

  async process(
    azureVariableGroup: AzureVariableGroup,
    _action: Action,
    args: ApplyArguments
  ): Promise<ProcessResult> {
    log.debug(`[ApplyVariableGroup] ${JSON.stringify(azureVariableGroup)}`)
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
      variableGroup.id = existingVariableGroup.id
      if (args.dryRun) {
        return {
          info: `Variable group ${variableGroup.name} update skipped because dry run.`,
        }
      } else {
        try {
          await variableGroupApi.updateVariableGroup(variableGroup, project)
          return {
            info: `Successfully updated variable group ${existingVariableGroup.id} (${existingVariableGroup.name})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      if (args.dryRun) {
        return {
          info: `Variable group ${variableGroup.name} creation skipped because dry run.`,
        }
      } else {
        try {
          const createdVariableGroup = await variableGroupApi.createVariableGroup(
            variableGroup,
            project
          )
          return {
            info: `Successfully created variable group ${createdVariableGroup.id} (${createdVariableGroup.name})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    }
  }
}

export { ApplyVariableGroup }
