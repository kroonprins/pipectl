import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { taskGroupApi } from '../adapters/task-group-api'
import { AzureTaskGroup } from '../model/azure-task-group'
import { GetTaskGroupProcessResult } from '../model/get-task-group-process-result'

class GetOneTaskGroup implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureTaskGroup &&
      action === Action.GET &&
      !!args.name
    )
  }

  async process(
    azureTaskGroup: AzureTaskGroup,
    _action: Action,
    args: GetArguments
  ): Promise<GetTaskGroupProcessResult> {
    log.debug(`[GetOneTaskGroup] ${JSON.stringify(azureTaskGroup)}`)
    try {
      const project = azureTaskGroup.project
      const [id, majorVersion] = args.name!.split(AzureTaskGroup.SEPARATOR)
      const taskGroup = await taskGroupApi.findTaskGroupById(
        id,
        Number(majorVersion),
        project
      )
      if (taskGroup) {
        return new GetTaskGroupProcessResult([taskGroup])
      } else {
        return {
          error: new Error(
            `Task group '${args.name}' does not exist in project '${project}'.`
          ),
        }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetOneTaskGroup }
