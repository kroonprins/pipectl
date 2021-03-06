import { Action, CommonArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  Definition,
  DefinitionTransformer,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { Kind } from '../model'
import { AzureReleaseDefinition } from '../model/azure-release-definition'
import { isAzureDevOps } from '../util'

class ReleaseDefinitionTransformer implements DefinitionTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      definition.kind === Kind.RELEASE_DEFINITION &&
      action !== Action.APPLY
    )
  }

  async transform(
    definition: Definition,
    _action: Action,
    _args: CommonArguments
  ) {
    log.debug(
      `[ReleaseDefinitionTransformer.transform] definition[${JSON.stringify(
        definition
      )}]`
    )
    const transformedSpec = await this.setReleaseDefinitionDefaults(definition)
    return new AzureReleaseDefinition(
      definition,
      definition.apiVersion,
      definition.kind as Kind,
      definition.metadata.namespace,
      transformedSpec
    ) // TODO "as Kind"
  }

  protected async setReleaseDefinitionDefaults(
    definition: Definition
  ): Promise<ReleaseDefinition> {
    return definition.spec as ReleaseDefinition
  }
}

export { ReleaseDefinitionTransformer }
