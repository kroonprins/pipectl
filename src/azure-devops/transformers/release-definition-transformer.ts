import { DefinitionTransformer, Definition } from "../../core/model"
import { isAzureDevOps } from "../util"
import { Kind } from '../model'
import { AzureReleaseDefinition } from "../model/azure-release-definition"
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { Action, CommonArguments } from "../../core/actions/model"

class ReleaseDefinitionTransformer implements DefinitionTransformer {
  canTransform(definition: Definition, action: Action, args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.RELEASE_DEFINITION && action !== Action.APPLY
  }
  async transform(definition: Definition, action: Action, args: CommonArguments) {
    const transformedSpec = await this.setReleaseDefinitionDefaults(definition)
    return new AzureReleaseDefinition(definition.apiVersion, definition.kind, definition.metadata.namespace, transformedSpec)
  }
  protected async setReleaseDefinitionDefaults(definition: Definition): Promise<ReleaseDefinition> {
    // TODO clone?
    const updatedSpec = definition.spec as ReleaseDefinition
    if (!updatedSpec.hasOwnProperty('path'))
      updatedSpec.path = "\\"
    return updatedSpec
  }
}

export {
  ReleaseDefinitionTransformer,
}
