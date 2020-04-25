import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitApi } from 'azure-devops-node-api/GitApi'
import { PullRequestStatus } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { azureConnection } from './connection'

class GitPullRequestApi {
  private _gitApi: GitApi | null = null

  /*private*/ async getApi(): Promise<GitApi> {
    if (!this._gitApi) {
      log.debug('Initializing GitPullRequestApi')
      this._gitApi = await azureConnection.get().getGitApi()
      log.debug('Initialized GitPullRequestApi')
    }
    return this._gitApi
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

  // async createGitPullRequest(gitPullRequest: GitPullRequest, project: string) {
  //   log.debug(
  //     `[GitPullRequestApi.createGitPullRequest] ${gitPullRequest.name}, project[${project}]`
  //   )
  //   const api = await this.getApi()
  //   return api.createPullRequest(gitPullRequest, project)
  // }

  // async updateGitPullRequest(gitPullRequest: GitPullRequest, project: string) {
  //   log.debug(
  //     `[GitPullRequestApi.updateGitPullRequest] ${gitPullRequest.name}, project[${project}]`
  //   )
  //   const api = await this.getApi()
  //   return api.updatePullRequest(gitPullRequest, gitPullRequest.id!, project)
  // }

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
