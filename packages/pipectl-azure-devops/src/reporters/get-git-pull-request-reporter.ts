import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { AzureGitPullRequest } from '../model/azure-git-pull-request'
import { GetGitPullRequestProcessResult } from '../model/get-git-pull-request-process-result'
import { GetReporter } from './get-reporter'

class GetGitPullRequestReporter extends GetReporter<
  GetGitPullRequestProcessResult,
  AzureGitPullRequest,
  GitPullRequest
> {
  constructor() {
    super(GetGitPullRequestProcessResult)
  }

  columns(): string[] {
    return ['NAME', 'DESCRIPTION', 'REVIEWERS']
  }

  line(
    gitPullRequest: GitPullRequest
  ): { [column: string]: string | undefined } {
    return {
      NAME: `${gitPullRequest.repository!.id}${AzureGitPullRequest.SEPARATOR}${
        gitPullRequest.pullRequestId
      }`,
      DESCRIPTION: gitPullRequest.title,
      REVIEWERS: gitPullRequest.reviewers
        ?.map((reviewer) => reviewer.uniqueName)
        .join(','),
    }
  }
}

export { GetGitPullRequestReporter }