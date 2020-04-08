import { VariableGroup } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { Action, CommonArguments } from 'pipectl-core/dist/actions/model'
import { Definition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'
import { applyDefaults } from './util/defaults'
import { defaultsVariableGroup } from './util/variable-group-defaults'
import { VariableGroupTransformer } from './variable-group-transformer'

class ApplyVariableGroupTransformer extends VariableGroupTransformer {

  canTransform(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.VARIABLE_GROUP && action === Action.APPLY
  }

  protected async setVariableGroupDefaults(definition: Definition): Promise<VariableGroup> {
    log.debug(`[ApplyVariableGroupTransformer.setVariableGroupDefaults] before[${JSON.stringify(definition)}]`)
    const updatedSpec = await applyDefaults(await super.setVariableGroupDefaults(definition), defaultsVariableGroup, definition)
    log.debug(`[ApplyVariableGroupTransformer.setVariableGroupDefaults] after[${JSON.stringify(updatedSpec)}]`)

    return updatedSpec
  }
}

export { ApplyVariableGroupTransformer }

