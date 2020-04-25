import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { gitPullRequestApi } from '../adapters/git-pull-request-api'
import { AzureGitPullRequest } from '../model/azure-git-pull-request'
import { GetGitPullRequestProcessResult } from '../model/get-git-pull-request-process-result'

class GetAllGitPullRequests implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureGitPullRequest &&
      action === Action.GET &&
      !args.name
    )
  }

  async process(
    azureGitPullRequest: AzureGitPullRequest,
    _action: Action,
    _args: GetArguments
  ): Promise<GetGitPullRequestProcessResult> {
    log.debug(`[GetAllGitPullRequests] ${JSON.stringify(azureGitPullRequest)}`)
    try {
      const project = azureGitPullRequest.project
      const gitPullRequests = await gitPullRequestApi.findAllGitPullRequests(
        project
      )
      if (gitPullRequests) {
        return new GetGitPullRequestProcessResult(gitPullRequests)
      } else {
        return new GetGitPullRequestProcessResult([])
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllGitPullRequests }
