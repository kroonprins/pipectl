import { BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces"
import { Action, CommonArguments } from "../../core/actions/model"
import { Definition, DefinitionTransformer } from "../../core/model"
import { Kind } from '../model'
import { AzureBuildDefinition } from "../model/azure-build-definition"
import { isAzureDevOps } from "../util"

class BuildDefinitionTransformer implements DefinitionTransformer {
  canTransform(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.BUILD_DEFINITION && action !== Action.APPLY
  }
  async transform(definition: Definition, _action: Action, _args: CommonArguments) {
    const transformedSpec = await this.setBuildDefinitionDefaults(definition)
    return new AzureBuildDefinition(definition.apiVersion, definition.kind as Kind, definition.metadata.namespace, transformedSpec) // TODO "as Kind"
  }
  protected async setBuildDefinitionDefaults(definition: Definition): Promise<BuildDefinition> {
    // TODO clone?
    const updatedSpec = definition.spec as BuildDefinition
    if (!updatedSpec.hasOwnProperty('path'))
      updatedSpec.path = "\\"
    return updatedSpec
  }
}

export { BuildDefinitionTransformer }

