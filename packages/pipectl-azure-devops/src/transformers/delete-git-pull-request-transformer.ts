import { Action, CommonArguments } from '@kroonprins/pipectl/dist/actions/model'
import { Definition } from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'
import { GitPullRequestTransformer } from './git-pull-request-transformer'
import { applyDefaults } from './util/defaults'
import { defaultsGitPullRequestForDelete } from './util/defaults-git-pull-request'

class DeleteGitPullRequestTransformer extends GitPullRequestTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      definition.kind === Kind.GIT_PULL_REQUEST &&
      action === Action.DELETE
    )
  }

  protected async setGitPullRequestDefaults(
    definition: Definition
  ): Promise<GitPullRequest> {
    log.debug(
      `[DeleteGitPullRequestTransformer.setGitPullRequestDefaults] before[${JSON.stringify(
        definition
      )}]`
    )
    const updatedSpec = await applyDefaults(
      await super.setGitPullRequestDefaults(definition),
      defaultsGitPullRequestForDelete,
      definition
    )
    log.debug(
      `[DeleteGitPullRequestTransformer.setGitPullRequestDefaults] after[${JSON.stringify(
        updatedSpec
      )}]`
    )

    return updatedSpec
  }
}

export { DeleteGitPullRequestTransformer }
