import { Definition } from '@kroonprins/pipectl/dist/model'
import {
  GitPullRequest,
  GitPullRequestCompletionOptions,
  GitRepository,
  IdentityRefWithVote,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces'
import { coreApi } from '../../adapters/core-api'
import { gitRepositoryApi } from '../../adapters/git-repository-api'
import { userApi } from '../../adapters/user-api'
import { applyDefaults, enumValue } from './defaults'

const repository = async (
  gitPullRequest: GitPullRequest,
  _key: string,
  definition: Definition
): Promise<GitRepository> => {
  const gitRepository = gitPullRequest.repository

  let projectId = await coreApi.findProjectIdByName(
    definition.metadata.namespace
  )
  if (gitRepository && gitRepository.hasOwnProperty('project')) {
    const project = gitRepository.project!
    if (project.id) {
      projectId = project.id!
    } else if (project.hasOwnProperty('name')) {
      projectId = await coreApi.findProjectIdByName(project.name!)
    }
  }

  if (
    gitRepository &&
    !gitRepository.hasOwnProperty('id') &&
    gitRepository.hasOwnProperty('name')
  ) {
    return {
      id: await gitRepositoryApi.findGitRepositoryIdByName(
        gitRepository.name!,
        projectId
      ),
      project: { id: projectId },
    }
  }
  return { id: gitRepository?.id, project: { id: projectId } }
}

const reviewers = async (
  gitPullRequest: GitPullRequest,
  _key: string,
  definition: Definition
): Promise<IdentityRefWithVote[]> => {
  const projectId = definition.metadata.namespace
  return Promise.all(
    (gitPullRequest.reviewers || []).map(async (reviewer) => {
      if (reviewer.id) {
        return { id: reviewer.id }
      } else if (reviewer.displayName) {
        return {
          id: await userApi.findUserIdByName(reviewer.displayName, projectId),
        }
      } else if (reviewer.uniqueName) {
        return {
          id: await userApi.findUserIdByName(reviewer.uniqueName, projectId),
        }
      } else if (typeof reviewer === 'string') {
        return { id: await userApi.findUserIdByName(reviewer, projectId) }
      }
      return reviewer
    })
  )
}

const completionOptions = async (
  gitPullRequest: GitPullRequest
): Promise<GitPullRequestCompletionOptions> =>
  applyDefaults(
    gitPullRequest.completionOptions || {},
    defaultsCompletionOptions
  )

const completionOptionsForDelete = async (
  gitPullRequest: GitPullRequest
): Promise<GitPullRequestCompletionOptions> =>
  applyDefaults(
    gitPullRequest.completionOptions || {},
    defaultsCompletionOptionsForDelete
  )

const defaultsGitPullRequest: GitPullRequest | object = {
  isDraft: false,
  supportsIterations: true,
  repository,
  status: enumValue(PullRequestStatus, PullRequestStatus.Active),
  reviewers,
  completionOptions,
}

const defaultsCompletionOptions: GitPullRequestCompletionOptions = {
  deleteSourceBranch: true,
}

const defaultsGitPullRequestForDelete: GitPullRequest | object = {
  repository,
  completionOptionsForDelete,
}

const defaultsCompletionOptionsForDelete: GitPullRequestCompletionOptions = {
  deleteSourceBranch: false,
}

export { defaultsGitPullRequest, defaultsGitPullRequestForDelete }
