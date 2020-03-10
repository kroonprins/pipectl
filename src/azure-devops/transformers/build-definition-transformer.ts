import { DefinitionTransformer, Definition, TransformedDefinition } from "../../core/model"
import { isAzureDevOps } from "../util"
import { Kind } from '../model'
import { AzureBuildDefinition } from "../model/azure-build-definition"
import { Action, CommonArguments } from "../../core/actions/model"
import { BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces"

class BuildDefinitionTransformer implements DefinitionTransformer {
  canTransform(definition: Definition, action: Action, args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.BUILD_DEFINITION && action !== Action.APPLY
  }
  async transform(definition: Definition, action: Action, args: CommonArguments) {
    const transformedSpec = await this.setBuildDefinitionDefaults(definition)
    return new AzureBuildDefinition(definition.apiVersion, definition.kind, definition.metadata.namespace, transformedSpec)
  }
  protected async setBuildDefinitionDefaults(definition: Definition): Promise<BuildDefinition> {
    // TODO clone?
    const updatedSpec = definition.spec as BuildDefinition
    if (!updatedSpec.hasOwnProperty('path'))
      updatedSpec.path = "\\"
    return updatedSpec
  }
}

export {
  BuildDefinitionTransformer,
}
