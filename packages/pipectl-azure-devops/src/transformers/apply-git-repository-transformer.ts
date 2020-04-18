import { Action, CommonArguments } from '@kroonprins/pipectl/dist/actions/model'
import { Definition } from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'
import { GitRepositoryTransformer } from './git-repository-transformer'
import { applyDefaults } from './util/defaults'
import { defaultsGitRepository } from './util/defaults-git-repository'

class ApplyGitRepositoryTransformer extends GitRepositoryTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      definition.kind === Kind.GIT_REPOSITORY &&
      action === Action.APPLY
    )
  }

  protected async setGitRepositoryDefaults(
    definition: Definition
  ): Promise<GitRepository> {
    log.debug(
      `[ApplyGitRepositoryTransformer.setGitRepositoryDefaults] before[${JSON.stringify(
        definition
      )}]`
    )
    const updatedSpec = await applyDefaults(
      await super.setGitRepositoryDefaults(definition),
      defaultsGitRepository,
      definition
    )
    log.debug(
      `[ApplyGitRepositoryTransformer.setGitRepositoryDefaults] after[${JSON.stringify(
        updatedSpec
      )}]`
    )

    return updatedSpec
  }
}

export { ApplyGitRepositoryTransformer }
