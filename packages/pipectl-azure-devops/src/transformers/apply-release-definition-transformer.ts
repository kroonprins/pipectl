import { Action, CommonArguments } from '@kroonprins/pipectl-core/dist/actions/model'
import { Definition } from '@kroonprins/pipectl-core/dist/model'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'
import { ReleaseDefinitionTransformer } from './release-definition-transformer'
import { applyDefaults } from './util/defaults'
import { defaultsReleaseDefinition } from './util/defaults-release-definition'

class ApplyReleaseDefinitionTransformer extends ReleaseDefinitionTransformer { // TODO instead of this, maybe possible to have multiple transformers applied (first ReleaseDefinitionTransformer for all then this one if action === Action.APPLY)?

  canTransform(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.RELEASE_DEFINITION && action === Action.APPLY
  }

  protected async setReleaseDefinitionDefaults(definition: Definition): Promise<ReleaseDefinition> {
    log.debug(`[ApplyReleaseDefinitionTransformer.setReleaseDefinitionDefaults] before[${JSON.stringify(definition)}]`)
    const updatedSpec = await applyDefaults(await super.setReleaseDefinitionDefaults(definition), defaultsReleaseDefinition, definition)
    log.debug(`[ApplyReleaseDefinitionTransformer.setReleaseDefinitionDefaults] after[${JSON.stringify(updatedSpec)}]`)

    return updatedSpec
  }
}

export { ApplyReleaseDefinitionTransformer }

