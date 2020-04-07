import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { Action, CommonArguments } from 'pipectl-core/dist/actions/model'
import { Definition, DefinitionTransformer } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { Kind } from '../model'
import { AzureReleaseDefinition } from '../model/azure-release-definition'
import { isAzureDevOps } from '../util'

class ReleaseDefinitionTransformer implements DefinitionTransformer {

  canTransform(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.RELEASE_DEFINITION && action !== Action.APPLY
  }

  async transform(definition: Definition, _action: Action, _args: CommonArguments) {
    log.debug(`[ReleaseDefinitionTransformer.transform] definition[${JSON.stringify(definition)}]`)
    const transformedSpec = await this.setReleaseDefinitionDefaults(definition)
    return new AzureReleaseDefinition(definition, definition.apiVersion, definition.kind as Kind, definition.metadata.namespace, transformedSpec) // TODO "as Kind"
  }

  protected async setReleaseDefinitionDefaults(definition: Definition): Promise<ReleaseDefinition> {
    // TODO clone?
    const updatedSpec = definition.spec as ReleaseDefinition
    if (!updatedSpec.hasOwnProperty('path'))
      updatedSpec.path = '\\'

    if (definition.metadata.labels) {
      const tags = Object.entries(definition.metadata.labels).map(([k, v]) => `${k}=${v}`)
      updatedSpec.tags = (updatedSpec.tags || []).concat(...tags)
    }
    return updatedSpec
  }
}

export { ReleaseDefinitionTransformer }

