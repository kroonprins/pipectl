import {
  GitPullRequest,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces'
import { $enum } from 'ts-enum-util'
import { Kind } from '../model'
import { AzureGitPullRequest } from '../model/azure-git-pull-request'
import { GetReporter } from './get-reporter'

class GetGitPullRequestReporter extends GetReporter<GitPullRequest> {
  constructor() {
    super(Kind.GIT_PULL_REQUEST)
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
      SOURCE: gitPullRequest.sourceRefName?.replace('refs/heads/', ''),
      TARGET: gitPullRequest.targetRefName?.replace('refs/heads/', ''),
      STATUS: $enum(PullRequestStatus).getKeyOrDefault(gitPullRequest.status),
    }
  }

  options() {
    return {
      truncate: true,
      config: {
        DESCRIPTION: {
          maxWidth: 40,
        },
        REPOSITORY: {
          maxWidth: 30,
        },
        REVIEWERS: {
          maxWidth: 50,
        },
        SOURCE: {
          maxWidth: 50,
        },
        TARGET: {
          maxWidth: 50,
        },
      },
    }
  }
}

export { GetGitPullRequestReporter }
