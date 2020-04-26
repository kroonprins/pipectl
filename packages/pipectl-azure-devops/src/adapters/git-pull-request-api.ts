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
    ) // TODO must give supportsIterations in input even though it is already in gitPullRequest?
  }

  async updateGitPullRequest(gitPullRequest: GitPullRequest, project: string) {
    log.debug(
      `[GitPullRequestApi.updateGitPullRequest] ${gitPullRequest.title}, project[${project}]`
    )
    const api = await this.getApi()
    return api.updatePullRequest(
      gitPullRequest,
      gitPullRequest.repository!.id!,
      gitPullRequest.pullRequestId!,
      project
    )
  }

  // async deleteGitPullRequest(id: string, project: string) {
  //   log.debug(
  //     `[GitPullRequestApi.deleteGitPullRequest] id[${id}], project[${project}]`
  //   )
  //   const api = await this.getApi()
  //   return api.deletePullRequest(id, project)
  // }
}

const gitPullRequestApi = new GitPullRequestApi()

export { GitPullRequestApi, gitPullRequestApi }
