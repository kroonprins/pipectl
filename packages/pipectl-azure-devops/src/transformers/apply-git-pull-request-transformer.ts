import { Action, CommonArguments } from '@kroonprins/pipectl/dist/actions/model'
import { Definition } from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'
import { GitPullRequestTransformer } from './git-pull-request-transformer'
import { applyDefaults } from './util/defaults'
import { defaultsGitPullRequest } from './util/defaults-git-pull-request'

class ApplyGitPullRequestTransformer extends GitPullRequestTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      definition.kind === Kind.GIT_PULL_REQUEST &&
      action === Action.APPLY
    )
  }

  protected async setGitPullRequestDefaults(
    definition: Definition
  ): Promise<GitPullRequest> {
    log.debug(
      `[ApplyGitPullRequestTransformer.setGitPullRequestDefaults] before[${JSON.stringify(
        definition
      )}]`
    )
    const updatedSpec = await applyDefaults(
      await super.setGitPullRequestDefaults(definition),
      defaultsGitPullRequest,
      definition
    )
    log.debug(
      `[ApplyGitPullRequestTransformer.setGitPullRequestDefaults] after[${JSON.stringify(
        updatedSpec
      )}]`
    )

    return updatedSpec
  }
}

export { ApplyGitPullRequestTransformer }
