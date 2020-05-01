import { Action, CommonArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  Definition,
  DefinitionTransformer,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { TaskGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { Kind } from '../model'
import { AzureTaskGroup } from '../model/azure-task-group'
import { isAzureDevOps } from '../util'

class TaskGroupTransformer implements DefinitionTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      definition.kind === Kind.TASK_GROUP &&
      action !== Action.APPLY
    )
  }

  async transform(
    definition: Definition,
    _action: Action,
    _args: CommonArguments
  ) {
    log.debug(
      `[TaskGroupTransformer.transform] definition[${JSON.stringify(
        definition
      )}]`
    )
    const transformedSpec = await this.setTaskGroupDefaults(definition)
    return new AzureTaskGroup(
      definition,
      definition.apiVersion,
      definition.kind as Kind,
      definition.metadata.namespace,
      transformedSpec
    ) // TODO "as Kind"
  }

  protected async setTaskGroupDefaults(
    definition: Definition
  ): Promise<TaskGroup> {
    return definition.spec as TaskGroup
  }
}

export { TaskGroupTransformer }
