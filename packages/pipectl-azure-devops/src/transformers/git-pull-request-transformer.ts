import { Action, CommonArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  Definition,
  DefinitionTransformer,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { Kind } from '../model'
import { AzureGitPullRequest } from '../model/azure-git-pull-request'
import { isAzureDevOps } from '../util'

class GitPullRequestTransformer implements DefinitionTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      definition.kind === Kind.GIT_PULL_REQUEST &&
      action !== Action.APPLY &&
      action !== Action.DELETE
    )
  }

  async transform(
    definition: Definition,
    _action: Action,
    _args: CommonArguments
  ) {
    log.debug(
      `[GitPullRequestTransformer.transform] definition[${JSON.stringify(
        definition
      )}]`
    )
    const transformedSpec = await this.setGitPullRequestDefaults(definition)
    return new AzureGitPullRequest(
      definition,
      definition.apiVersion,
      definition.kind as Kind,
      definition.metadata.namespace,
      transformedSpec
    ) // TODO "as Kind"
  }

  protected async setGitPullRequestDefaults(
    definition: Definition
  ): Promise<GitPullRequest> {
    return definition.spec as GitPullRequest
  }
}

export { GitPullRequestTransformer }
