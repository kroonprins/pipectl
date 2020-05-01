import { Action, CommonArguments } from '@kroonprins/pipectl/dist/actions/model'
import { Definition } from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { TaskGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'
import { TaskGroupTransformer } from './task-group-transformer'
import { applyDefaults } from './util/defaults'
import { defaultsTaskGroup } from './util/defaults-task-group'

class ApplyTaskGroupTransformer extends TaskGroupTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      definition.kind === Kind.TASK_GROUP &&
      action === Action.APPLY
    )
  }

  protected async setTaskGroupDefaults(
    definition: Definition
  ): Promise<TaskGroup> {
    log.debug(
      `[ApplyTaskGroupTransformer.setTaskGroupDefaults] before[${JSON.stringify(
        definition
      )}]`
    )
    const updatedSpec = await applyDefaults(
      await super.setTaskGroupDefaults(definition),
      defaultsTaskGroup,
      definition
    )
    log.debug(
      `[ApplyTaskGroupTransformer.setTaskGroupDefaults] after[${JSON.stringify(
        updatedSpec
      )}]`
    )

    return updatedSpec
  }
}

export { ApplyTaskGroupTransformer }
