import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  TransformedDefinition,
  ProcessResult,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { gitPullRequestApi } from '../adapters/git-pull-request-api'
import { AzureGitPullRequest } from '../model/azure-git-pull-request'

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
  ): Promise<ProcessResult> {
    log.debug(`[GetAllGitPullRequests] ${JSON.stringify(azureGitPullRequest)}`)
    try {
      const project = azureGitPullRequest.project
      const gitPullRequests = await gitPullRequestApi.findAllGitPullRequests(
        project
      )
      if (gitPullRequests) {
        return {
          results: gitPullRequests.map((gitPullRequest) => {
            return {
              apiVersion: azureGitPullRequest.apiVersion,
              kind: azureGitPullRequest.kind,
              metadata: {
                namespace: azureGitPullRequest.project,
                labels: {},
              },
              spec: gitPullRequest,
            }
          }),
          properties: { type: azureGitPullRequest.kind },
        }
      } else {
        return { results: [], properties: { type: azureGitPullRequest.kind } }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllGitPullRequests }
