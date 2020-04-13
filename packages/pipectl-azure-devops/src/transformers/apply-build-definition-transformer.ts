import {
  Action,
  CommonArguments,
} from '@kroonprins/pipectl-core/dist/actions/model'
import { Definition } from '@kroonprins/pipectl-core/dist/model'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import { BuildDefinition } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'
import { BuildDefinitionTransformer } from './build-definition-transformer'
import { applyDefaults } from './util/defaults'
import { defaultsBuildDefinition } from './util/defaults-build-definition'

class ApplyBuildDefinitionTransformer extends BuildDefinitionTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      definition.kind === Kind.BUILD_DEFINITION &&
      action === Action.APPLY
    )
  }

  protected async setBuildDefinitionDefaults(
    definition: Definition
  ): Promise<BuildDefinition> {
    log.debug(
      `[ApplyBuildDefinitionTransformer.setBuildDefinitionDefaults] before[${JSON.stringify(
        definition
      )}]`
    )
    const updatedSpec = await applyDefaults(
      await super.setBuildDefinitionDefaults(definition),
      defaultsBuildDefinition,
      definition
    )
    log.debug(
      `[ApplyBuildDefinitionTransformer.setBuildDefinitionDefaults] after[${JSON.stringify(
        updatedSpec
      )}]`
    )

    return updatedSpec
  }
}

export { ApplyBuildDefinitionTransformer }
