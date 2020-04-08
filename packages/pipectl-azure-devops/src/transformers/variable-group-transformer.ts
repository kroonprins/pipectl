import { VariableGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { Action, CommonArguments } from 'pipectl-core/dist/actions/model'
import { Definition, DefinitionTransformer } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { Kind } from '../model'
import { AzureVariableGroup } from '../model/azure-variable-group'
import { isAzureDevOps } from '../util'

class VariableGroupTransformer implements DefinitionTransformer {

  canTransform(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.VARIABLE_GROUP && action !== Action.APPLY
  }

  async transform(definition: Definition, _action: Action, _args: CommonArguments) {
    log.debug(`[VariableGroupTransformer.transform] definition[${JSON.stringify(definition)}]`)
    const transformedSpec = await this.setVariableGroupDefaults(definition)
    return new AzureVariableGroup(definition, definition.apiVersion, definition.kind as Kind, definition.metadata.namespace, transformedSpec) // TODO "as Kind"
  }

  protected async setVariableGroupDefaults(definition: Definition): Promise<VariableGroup> {
    return definition.spec as VariableGroup
  }
}

export { VariableGroupTransformer }

