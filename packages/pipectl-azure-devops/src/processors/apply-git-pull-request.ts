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

class ApplyGitPullRequest implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    _args: ApplyArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureGitPullRequest &&
      action === Action.APPLY
    )
  }

  async process(
    azureGitPullRequest: AzureGitPullRequest,
    _action: Action,
    args: ApplyArguments
  ): Promise<ProcessResult> {
    log.debug(`[ApplyGitPullRequest] ${JSON.stringify(azureGitPullRequest)}`)
    const gitPullRequest = azureGitPullRequest.spec
    const project = azureGitPullRequest.project
    const id = gitPullRequest.pullRequestId

    let existingGitPullRequest: GitPullRequest | undefined
    if (id) {
      existingGitPullRequest = await gitPullRequestApi.findGitPullRequestById(
        id,
        gitPullRequest.repository!.id!,
        project
      )
    } else {
      existingGitPullRequest = await gitPullRequestApi.findGitPullRequestByTitleAndBranches(
        gitPullRequest.title!,
        gitPullRequest.sourceRefName!,
        gitPullRequest.targetRefName!,
        gitPullRequest.repository!.id!,
        project
      )
    }
    if (existingGitPullRequest) {
      gitPullRequest.pullRequestId = existingGitPullRequest.pullRequestId
      if (args.dryRun) {
        return {
          info: `Git pull request '${gitPullRequest.title}' update skipped because dry run.`,
        }
      } else {
        try {
          await gitPullRequestApi.updateGitPullRequest(gitPullRequest, project)
          return {
            info: `Successfully updated git pull request ${existingGitPullRequest.pullRequestId} (${existingGitPullRequest.title})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      if (args.dryRun) {
        return {
          info: `Git pull request '${gitPullRequest.title}' creation skipped because dry run.`,
        }
      } else {
        try {
          const createdGitPullRequest = await gitPullRequestApi.createGitPullRequest(
            gitPullRequest,
            project
          )
          return {
            info: `Successfully created git pull request ${createdGitPullRequest.pullRequestId} (${createdGitPullRequest.title})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    }
  }
}

export { ApplyGitPullRequest }
