import {
  Action,
  CommonArguments,
} from '@kroonprins/pipectl-core/dist/actions/model'
import {
  Definition,
  DefinitionTransformer,
} from '@kroonprins/pipectl-core/dist/model'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import { BuildDefinition } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { Kind } from '../model'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { isAzureDevOps } from '../util'

class BuildDefinitionTransformer implements DefinitionTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      definition.kind === Kind.BUILD_DEFINITION &&
      action !== Action.APPLY
    )
  }

  async transform(
    definition: Definition,
    _action: Action,
    _args: CommonArguments
  ) {
    log.debug(
      `[BuildDefinitionTransformer.transform] definition[${JSON.stringify(
        definition
      )}]`
    )
    const transformedSpec = await this.setBuildDefinitionDefaults(definition)
    return new AzureBuildDefinition(
      definition,
      definition.apiVersion,
      definition.kind as Kind,
      definition.metadata.namespace,
      transformedSpec
    ) // TODO "as Kind"
  }

  protected async setBuildDefinitionDefaults(
    definition: Definition
  ): Promise<BuildDefinition> {
    return definition.spec as BuildDefinition
  }
}

export { BuildDefinitionTransformer }
