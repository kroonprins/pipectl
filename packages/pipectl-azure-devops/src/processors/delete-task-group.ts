import { Action, ApplyArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { TaskGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { taskGroupApi } from '../adapters/task-group-api'
import { AzureTaskGroup } from '../model/azure-task-group'

class DeleteTaskGroup implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    _args: ApplyArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureTaskGroup &&
      action === Action.DELETE
    )
  }

  async process(
    azureTaskGroup: AzureTaskGroup,
    _action: Action,
    args: ApplyArguments
  ): Promise<ProcessResult> {
    log.debug(`[DeleteTaskGroup] ${JSON.stringify(azureTaskGroup)}`)
    const taskGroup = azureTaskGroup.spec
    const project = azureTaskGroup.project
    const id = taskGroup.id

    let existingTaskGroup: TaskGroup | undefined
    if (id) {
      existingTaskGroup = await taskGroupApi.findTaskGroupByIdWithoutVersion(
        id,
        project
      )
    } else {
      existingTaskGroup = await taskGroupApi.findTaskGroupByNameWithoutVersion(
        taskGroup.name!,
        project
      )
    }
    if (existingTaskGroup) {
      if (args.dryRun) {
        return {
          info: `Task group '${taskGroup.name}' deletion skipped because dry run.`,
        }
      } else {
        try {
          await taskGroupApi.deleteTaskGroup(existingTaskGroup.id!, project)
          return {
            info: `Successfully deleted task group ${existingTaskGroup.id} (${existingTaskGroup.name})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      return {
        info: `Task group '${taskGroup.name}' not deleted because it does not exist.`,
      }
    }
  }
}

export { DeleteTaskGroup }
