import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitApi } from 'azure-devops-node-api/GitApi'
import {
  GitPullRequest,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces'
import { azureConnection } from './connection'

class GitPullRequestApi {
  private _gitApi: GitApi | null = null

  private async getApi(): Promise<GitApi> {
    if (!this._gitApi) {
      log.debug('Initializing GitPullRequestApi')
      this._gitApi = await azureConnection.get().getGitApi()
      log.debug('Initialized GitPullRequestApi')
    }
    return this._gitApi
  }

  async findGitPullRequestByTitleAndBranches(
    title: string,
    sourceRefName: string,
    targetRefName: string,
    repositoryId: string,
    project: string
  ): Promise<GitPullRequest | undefined> {
    log.debug(
      `[GitPullRequestApi.findGitPullRequestByTitleAndBranches] title[${title}], sourceRefName[${sourceRefName}], targetRefName[${targetRefName}], repositoryId[${repositoryId}], project[${project}]`
    )
    const api = await this.getApi()
    const search = await api.getPullRequests(
      repositoryId,
      { status: PullRequestStatus.Active },
      project
    )
    if (search && search.length) {
      const found = search.find(
        (pullRequest) =>
          pullRequest.title === title &&
          pullRequest.sourceRefName === sourceRefName &&
          pullRequest.targetRefName === targetRefName
      )
      log.debug(
        `[GitPullRequestApi.findGitPullRequestByTitleAndBranches] found ${found} (${search.length}) for title[${title}], sourceRefName[${sourceRefName}], targetRefName[${targetRefName}], repositoryId[${repositoryId}], project[${project}]`
      )
      return found
    }
    log.debug(
      `[GitPullRequestApi.findGitPullRequestByTitleAndBranches] not found for title[${title}], sourceRefName[${sourceRefName}], targetRefName[${targetRefName}], repositoryId[${repositoryId}], project[${project}]`
    )
    return
  }

  async findGitPullRequestById(
    pullRequestId: number,
    repositoryId: string,
    project: string
  ) {
    log.debug(
      `[GitPullRequestApi.findGitPullRequestById] pullRequestId[${pullRequestId}], repositoryId[${repositoryId}], project[${project}]`
    )
    const api = await this.getApi()
    const gitPullRequest = await api.getPullRequest(
      repositoryId,
      pullRequestId,
      project
    )
    if (gitPullRequest) {
      return gitPullRequest
    }
    throw new Error(
      `Git PullRequest with id ${pullRequestId} not found in project ${project} for repository ${repositoryId}. It either doesn't exist or you do not have the required access for it.`
    )
  }

  async findAllGitPullRequests(project: string) {
    log.debug(`[GitPullRequestApi.findAllGitRepositories] project[${project}]`)
    const api = await this.getApi()
    return api.getPullRequestsByProject(project, {
      status: PullRequestStatus.Active,
    })
  }

  async createGitPullRequest(gitPullRequest: GitPullRequest, project: string) {
    log.debug(
      `[GitPullRequestApi.createGitPullRequest] ${gitPullRequest.title}, project[${project}]`
    )
    const api = await this.getApi()
    return api.createPullRequest(
      gitPullRequest,
      gitPullRequest.repository!.id!,
      project
    )
  }

  async updateGitPullRequest(
    existingGitPullRequest: GitPullRequest,
    updatedGitPullRequest: GitPullRequest,
    project: string
  ) {
    log.debug(
      `[GitPullRequestApi.updateGitPullRequest] ${updatedGitPullRequest.title}, project[${project}]`
    )
    const repositoryId = updatedGitPullRequest.repository!.id!
    const pullRequestId = updatedGitPullRequest.pullRequestId!
    const updateRequest = {
      title:
        existingGitPullRequest.title !== updatedGitPullRequest.title
          ? updatedGitPullRequest.title
          : undefined,
      description:
        existingGitPullRequest.description !== updatedGitPullRequest.description
          ? updatedGitPullRequest.description
            ? updatedGitPullRequest.description
            : ' '
          : undefined,
      status:
        existingGitPullRequest.status !== updatedGitPullRequest.status
          ? updatedGitPullRequest.status
          : undefined,
      targetRefName:
        existingGitPullRequest.targetRefName !==
        updatedGitPullRequest.targetRefName
          ? updatedGitPullRequest.targetRefName
          : undefined,
    }
    log.debug(
      `[GitPullRequestApi.updateGitPullRequest] update request ${JSON.stringify(
        updateRequest
      )}`
    )
    const api = await this.getApi()
    await api.updatePullRequest(
      updateRequest,
      repositoryId,
      pullRequestId,
      project
    )

    const existingGitPullRequestReviewers = (
      existingGitPullRequest.reviewers || []
    ).map((reviewer) => reviewer.id!)
    const updatedGitPullRequestReviewers = (
      updatedGitPullRequest.reviewers || []
    ).map((reviewer) => reviewer.id!)

    const reviewersToRemove = existingGitPullRequestReviewers.filter(
      (x) => !updatedGitPullRequestReviewers.includes(x)
    )
    log.debug(
      `[GitPullRequestApi.updateGitPullRequest] reviewers to remove ${JSON.stringify(
        reviewersToRemove
      )}`
    )
    const reviewersToAdd = updatedGitPullRequestReviewers.filter(
      (x) => !existingGitPullRequestReviewers.includes(x)
    )
    log.debug(
      `[GitPullRequestApi.updateGitPullRequest] reviewers to add ${JSON.stringify(
        reviewersToAdd
      )}`
    )
    return Promise.all([
      ...reviewersToRemove.map(
        (reviewerId) =>
          api.deletePullRequestReviewer(
            repositoryId,
            pullRequestId,
            reviewerId,
            project
          ),
        ...reviewersToAdd.map((reviewerId) =>
          api.createPullRequestReviewer(
            { id: reviewerId },
            repositoryId,
            pullRequestId,
            reviewerId,
            project
          )
        )
      ),
    ])
  }

  async deleteGitPullRequest(
    repositoryId: string,
    pullRequestId: number,
    project: string
  ) {
    log.debug(
      `[GitPullRequestApi.deleteGitPullRequest] repositoryId[${repositoryId}], pullRequestId[${pullRequestId}], project[${project}]`
    )
    const api = await this.getApi()
    return api.updatePullRequest(
      { status: PullRequestStatus.Abandoned },
      repositoryId,
      pullRequestId,
      project
    )
  }
}

const gitPullRequestApi = new GitPullRequestApi()

export { GitPullRequestApi, gitPullRequestApi }
