import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitApi } from 'azure-devops-node-api/GitApi'
import {
  GitPullRequest,
  GitRefUpdate,
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
    return api.getPullRequestsByProject(
      project,
      {
        status: PullRequestStatus.Active,
      },
      undefined,
      undefined,
      -1
    )
  }

  async createGitPullRequest(gitPullRequest: GitPullRequest, project: string) {
    log.debug(
      `[GitPullRequestApi.createGitPullRequest] title[${gitPullRequest.title}], project[${project}]`
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
      `[GitPullRequestApi.updateGitPullRequest] title[${updatedGitPullRequest.title}], project[${project}]`
    )
    const api = await this.getApi()
    const repositoryId = updatedGitPullRequest.repository!.id!
    const pullRequestId = updatedGitPullRequest.pullRequestId!

    let updateRequest: GitPullRequest = {
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

    const isCompletionRequest =
      existingGitPullRequest.status === PullRequestStatus.Active &&
      updatedGitPullRequest.status === PullRequestStatus.Completed
    if (isCompletionRequest) {
      updateRequest = {
        ...updateRequest,
        lastMergeSourceCommit: {
          commitId: existingGitPullRequest.lastMergeSourceCommit?.commitId,
        },
        completionOptions: updatedGitPullRequest.completionOptions,
      }
    }
    log.debug(
      `[GitPullRequestApi.updateGitPullRequest] update request ${JSON.stringify(
        updateRequest
      )}`
    )
    await api.updatePullRequest(
      updateRequest,
      repositoryId,
      pullRequestId,
      project
    )

    if (updatedGitPullRequest.status === PullRequestStatus.Active) {
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
      Promise.all([
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
  }

  async deleteGitPullRequest(
    existingGitPullRequest: GitPullRequest,
    updatedGitPullRequest: GitPullRequest,
    project: string
  ) {
    const api = await this.getApi()
    const repositoryId = existingGitPullRequest.repository!.id!
    const pullRequestId = existingGitPullRequest.pullRequestId!
    log.debug(
      `[GitPullRequestApi.deleteGitPullRequest] repositoryId[${repositoryId}], pullRequestId[${pullRequestId}], project[${project}]`
    )

    await api.updatePullRequest(
      { status: PullRequestStatus.Abandoned },
      repositoryId,
      pullRequestId,
      project
    )

    if (updatedGitPullRequest.completionOptions?.deleteSourceBranch) {
      const refUpdateRequest: GitRefUpdate = {
        name: existingGitPullRequest.sourceRefName,
        newObjectId: '0000000000000000000000000000000000000000',
        oldObjectId: existingGitPullRequest!.lastMergeSourceCommit!.commitId!,
        repositoryId,
      }
      log.debug(
        `[GitPullRequestApi.deleteGitPullRequest] deleting source branch for repositoryId[${repositoryId}], pullRequestId[${pullRequestId}], project[${project}], updateRequest[${JSON.stringify(
          refUpdateRequest
        )}]`
      )
      await api.updateRefs([refUpdateRequest], repositoryId, project)
    }
  }
}

const gitPullRequestApi = new GitPullRequestApi()

export { GitPullRequestApi, gitPullRequestApi }
