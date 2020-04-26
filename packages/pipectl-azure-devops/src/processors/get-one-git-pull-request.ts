import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { gitPullRequestApi } from '../adapters/git-pull-request-api'
import { AzureGitPullRequest } from '../model/azure-git-pull-request'
import { GetGitPullRequestProcessResult } from '../model/get-git-pull-request-process-result'

class GetOneGitPullRequest implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureGitPullRequest &&
      action === Action.GET &&
      !!args.name
    )
  }

  async process(
    azureGitPullRequest: AzureGitPullRequest,
    _action: Action,
    args: GetArguments
  ): Promise<GetGitPullRequestProcessResult> {
    log.debug(`[GetOneGitPullRequest] ${JSON.stringify(azureGitPullRequest)}`)
    try {
      const project = azureGitPullRequest.project
      const [repositoryId, pullRequestId] = args.name!.split(
        AzureGitPullRequest.SEPARATOR
      )
      const gitPullRequest = await gitPullRequestApi.findGitPullRequestById(
        Number(pullRequestId),
        repositoryId,
        project
      )
      if (gitPullRequest) {
        return new GetGitPullRequestProcessResult([gitPullRequest])
      } else {
        return {
          error: new Error(
            `Pull request '${args.name}' does not exist in project '${project}'.`
          ),
        }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetOneGitPullRequest }
