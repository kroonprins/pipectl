import {
  GitPullRequest,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces'
import { enumValue, filterProp, object } from './export'

const reviewers = async (gitPullRequest: GitPullRequest): Promise<string[]> => {
  return (gitPullRequest.reviewers || []).map(
    (reviewer) => reviewer.uniqueName!
  )
}

const description = async (
  gitPullRequest: GitPullRequest
): Promise<string | undefined> => {
  return gitPullRequest.description !== gitPullRequest.title
    ? gitPullRequest.description
    : undefined
}

const exportGitPullRequest: GitPullRequest | object = {
  pullRequestId: filterProp,
  description,
  repository: object({
    id: filterProp,
    url: filterProp,
    project: filterProp,
    size: filterProp,
    remoteUrl: filterProp,
    sshUrl: filterProp,
    webUrl: filterProp,
  }),
  codeReviewId: filterProp,
  status: enumValue(PullRequestStatus, PullRequestStatus.Active),
  createdBy: filterProp,
  creationDate: filterProp,
  mergeStatus: filterProp,
  isDraft: false,
  mergeId: filterProp,
  lastMergeSourceCommit: filterProp,
  lastMergeTargetCommit: filterProp,
  lastMergeCommit: filterProp,
  reviewers,
  url: filterProp,
  _links: filterProp,
  supportsIterations: true,
  artifactId: filterProp,
}

export { exportGitPullRequest }
