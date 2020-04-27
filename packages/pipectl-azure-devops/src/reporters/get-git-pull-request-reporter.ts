import {
  GitPullRequest,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces'
import { $enum } from 'ts-enum-util'
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
    return [
      'NAME',
      'DESCRIPTION',
      'REPOSITORY',
      'REVIEWERS',
      'SOURCE',
      'TARGET',
      'STATUS',
    ]
  }

  line(
    gitPullRequest: GitPullRequest
  ): { [column: string]: string | undefined } {
    return {
      NAME: `${gitPullRequest.repository!.id}${AzureGitPullRequest.SEPARATOR}${
        gitPullRequest.pullRequestId
      }`,
      DESCRIPTION: gitPullRequest.title,
      REPOSITORY: gitPullRequest.repository?.name,
      REVIEWERS: gitPullRequest.reviewers
        ?.map((reviewer) => reviewer.uniqueName)
        .join(','),
      SOURCE: gitPullRequest.sourceRefName,
      TARGET: gitPullRequest.targetRefName,
      STATUS: $enum(PullRequestStatus).getKeyOrDefault(gitPullRequest.status),
    }
  }
}

export { GetGitPullRequestReporter }
