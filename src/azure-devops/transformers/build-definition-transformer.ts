import { DefinitionTransformer, Definition, TransformedDefinition } from "../../core/model"
import { isAzureDevOps } from "../util"
import { Kind } from '../model'
import { AzureBuildDefinition } from "../model/azure-build-definition"
import { Action, CommonArguments } from "../../core/actions/model"

class BuildDefinitionTransformer implements DefinitionTransformer {
  canTransform(definition: Definition): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.BUILD_DEFINITION
  }
  async transform(definition: Definition, action: Action, args: CommonArguments) {
    return new AzureBuildDefinition(
      definition.apiVersion,
      definition.kind,
      definition.metadata.namespace,
      definition.spec
    )
  }
}

export {
  BuildDefinitionTransformer,
}
