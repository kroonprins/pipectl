import { Action, ApplyArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { gitPullRequestApi } from '../adapters/git-pull-request-api'
import { AzureGitPullRequest } from '../model/azure-git-pull-request'

class DeleteGitPullRequest implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    _args: ApplyArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureGitPullRequest &&
      action === Action.DELETE
    )
  }

  async process(
    azureGitPullRequest: AzureGitPullRequest,
    _action: Action,
    args: ApplyArguments
  ): Promise<ProcessResult> {
    log.debug(`[DeleteGitPullRequest] ${JSON.stringify(azureGitPullRequest)}`)
    const gitPullRequest = azureGitPullRequest.spec
    const project = azureGitPullRequest.project
    const pullRequestId = gitPullRequest.pullRequestId
    const repositoryId = gitPullRequest.repository!.id!

    let existingGitPullRequest: GitPullRequest | undefined
    if (pullRequestId) {
      existingGitPullRequest = await gitPullRequestApi.findGitPullRequestById(
        pullRequestId,
        repositoryId,
        project
      )
    } else {
      existingGitPullRequest = await gitPullRequestApi.findGitPullRequestByTitleAndBranches(
        gitPullRequest.title!,
        gitPullRequest.sourceRefName!,
        gitPullRequest.targetRefName!,
        repositoryId,
        project
      )
    }
    if (existingGitPullRequest) {
      if (args.dryRun) {
        return {
          info: `Git pull request '${gitPullRequest.title}' deletion skipped because dry run.`,
        }
      } else {
        try {
          await gitPullRequestApi.deleteGitPullRequest(
            existingGitPullRequest,
            gitPullRequest,
            project
          )
          return {
            info: `Successfully deleted git pull request ${existingGitPullRequest.pullRequestId} (${existingGitPullRequest.title})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      return {
        info: `Git pull request '${gitPullRequest.title}' not deleted because it does not exist.`,
      }
    }
  }
}

export { DeleteGitPullRequest }
