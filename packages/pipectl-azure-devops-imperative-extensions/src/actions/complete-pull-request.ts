import { Kind } from '@kroonprins/pipectl-azure-devops/dist/model'
import { AzureGitPullRequest } from '@kroonprins/pipectl-azure-devops/dist/model/azure-git-pull-request'
import { API_VERSION } from '@kroonprins/pipectl-azure-devops/dist/util'
import { Action } from '@kroonprins/pipectl/dist/actions/model'
import { process } from '@kroonprins/pipectl/dist/process'
import { namespace } from '@kroonprins/pipectl/dist/util'
import { PullRequestStatus } from 'azure-devops-node-api/interfaces/GitInterfaces'

interface Arguments {
  id: string
}

export default async (args: Arguments) => {
  const [repositoryId, pullRequestId] = args.id.split(
    AzureGitPullRequest.SEPARATOR
  )
  return process(
    [
      {
        apiVersion: API_VERSION,
        kind: Kind.GIT_PULL_REQUEST,
        metadata: {
          namespace: namespace({}),
        },
        spec: {
          pullRequestId,
          repository: {
            id: repositoryId,
          },
          status: PullRequestStatus.Completed,
        },
      },
    ],
    Action.APPLY,
    {}
  )
}
