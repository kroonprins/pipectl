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

class ApplyTaskGroup implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    _args: ApplyArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureTaskGroup && action === Action.APPLY
    )
  }

  async process(
    azureTaskGroup: AzureTaskGroup,
    _action: Action,
    args: ApplyArguments
  ): Promise<ProcessResult> {
    log.debug(`[ApplyTaskGroup] ${JSON.stringify(azureTaskGroup)}`)
    const taskGroup = azureTaskGroup.spec
    const project = azureTaskGroup.project
    const id = taskGroup.id
    const majorVersion = taskGroup.version!.major!

    let existingTaskGroup: TaskGroup | undefined
    if (id) {
      existingTaskGroup = await taskGroupApi.findTaskGroupById(
        id,
        majorVersion,
        project
      )
    } else {
      existingTaskGroup = await taskGroupApi.findTaskGroupByName(
        taskGroup.name!,
        majorVersion,
        project
      )
    }
    if (existingTaskGroup) {
      taskGroup.id = existingTaskGroup.id
      if (args.dryRun) {
        return {
          info: `Task group '${taskGroup.name}' update skipped because dry run.`,
        }
      } else {
        try {
          await taskGroupApi.updateTaskGroup(taskGroup, project)
          return {
            info: `Successfully updated task group ${existingTaskGroup.id} (${existingTaskGroup.name})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      if (args.dryRun) {
        return {
          info: `Task group '${taskGroup.name}' creation skipped because dry run.`,
        }
      } else {
        try {
          const createdTaskGroup = await taskGroupApi.createTaskGroup(
            taskGroup,
            project
          )
          return {
            info: `Successfully created task group ${createdTaskGroup.id} (${createdTaskGroup.name})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    }
  }
}

export { ApplyTaskGroup }
