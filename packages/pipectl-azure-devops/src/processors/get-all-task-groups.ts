import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { taskGroupApi } from '../adapters/task-group-api'
import { AzureTaskGroup } from '../model/azure-task-group'
import { GetTaskGroupProcessResult } from '../model/get-task-group-process-result'

class GetAllTaskGroups implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureTaskGroup &&
      action === Action.GET &&
      !args.name
    )
  }

  async process(
    azureTaskGroup: AzureTaskGroup,
    _action: Action,
    _args: GetArguments
  ): Promise<GetTaskGroupProcessResult> {
    log.debug(`[GetAllTaskGroups] ${JSON.stringify(azureTaskGroup)}`)
    try {
      const project = azureTaskGroup.project
      const taskGroups = await taskGroupApi.findAllTaskGroups(project)
      if (taskGroups) {
        return new GetTaskGroupProcessResult(taskGroups)
      } else {
        return new GetTaskGroupProcessResult([])
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllTaskGroups }
