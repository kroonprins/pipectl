import { Definition } from '@kroonprins/pipectl/dist/model'
import {
  GitPullRequest,
  GitRepository,
  IdentityRefWithVote,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces'
import { coreApi } from '../../adapters/core-api'
import { gitRepositoryApi } from '../../adapters/git-repository-api'
import { userApi } from '../../adapters/user-api'
import { enumValue } from './defaults'

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

const defaultsGitPullRequest: GitPullRequest | object = {
  isDraft: false,
  supportsIterations: true,
  repository,
  status: enumValue(PullRequestStatus, PullRequestStatus.Active),
  reviewers,
}

const defaultsGitPullRequestForDelete: GitPullRequest | object = {
  repository,
}

export { defaultsGitPullRequest, defaultsGitPullRequestForDelete }
