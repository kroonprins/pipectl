import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { taskGroupApi } from '../adapters/task-group-api'
import { AzureTaskGroup } from '../model/azure-task-group'

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
  ): Promise<ProcessResult> {
    log.debug(`[GetAllTaskGroups] ${JSON.stringify(azureTaskGroup)}`)
    try {
      const project = azureTaskGroup.project
      const taskGroups = await taskGroupApi.findAllTaskGroups(project)
      if (taskGroups) {
        return {
          results: taskGroups.map((taskGroup) => {
            return {
              apiVersion: azureTaskGroup.apiVersion,
              kind: azureTaskGroup.kind,
              metadata: {
                namespace: azureTaskGroup.project,
                labels: {},
              },
              spec: taskGroup,
            }
          }),
          properties: { type: azureTaskGroup.kind },
        }
      } else {
        return { results: [], properties: { type: azureTaskGroup.kind } }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllTaskGroups }
