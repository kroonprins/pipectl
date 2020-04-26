import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitApi } from 'azure-devops-node-api/GitApi'
import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces'
import memoize from 'p-memoize'
import { azureConnection } from './connection'

class GitRepositoryApi {
  private _gitApi: GitApi | null = null

  private async getApi(): Promise<GitApi> {
    if (!this._gitApi) {
      log.debug('Initializing GitRepositoryApi')
      this._gitApi = await azureConnection.get().getGitApi()
      log.debug('Initialized GitRepositoryApi')
    }
    return this._gitApi
  }

  findGitRepositoryIdByName = memoize(this._findGitRepositoryIdByName, {
    cacheKey: JSON.stringify,
  })

  private async _findGitRepositoryIdByName(
    name: string,
    project: string
  ): Promise<string> {
    log.debug(
      `[GitRepositoryApi._findGitRepositoryIdByName] name[${name}], project[${project}]`
    )
    const search = await this.findGitRepositoryByName(name, project)
    if (search) {
      return search.id!
    }
    throw new Error(
      `Git repository with name ${name} not found in project ${project}. It either doesn't exist or you do not have the required access for it.`
    )
  }

  async findGitRepositoryByName(
    name: string,
    project: string
  ): Promise<GitRepository | undefined> {
    log.debug(
      `[GitRepositoryApi.findGitRepositoryByName] name[${name}], project[${project}]`
    )
    const api = await this.getApi()
    const search = await api.getRepositories(project)
    if (search && search.length) {
      const found = search.find((repo) => repo.name === name)
      log.debug(
        `[GitRepositoryApi.findGitRepositoryByName] found ${found} (${search.length}) for name[${name}], project[${project}]`
      )
      return found
    }
    log.debug(
      `[GitRepositoryApi.findGitRepositoryByName] not found for name[${name}], project[${project}]`
    )
    return
  }

  async findGitRepositoryById(id: string, project: string) {
    log.debug(
      `[GitRepositoryApi.findGitRepositoryById] id[${id}], project[${project}]`
    )
    const api = await this.getApi()
    const gitRepository = await api.getRepository(id, project)
    if (gitRepository) {
      return gitRepository
    }
    throw new Error(
      `Git repository with id ${id} not found in project ${project}. It either doesn't exist or you do not have the required access for it.`
    )
  }

  async findAllGitRepositories(project: string) {
    log.debug(`[GitRepositoryApi.findAllGitRepositories] project[${project}]`)
    const api = await this.getApi()
    return api.getRepositories(project)
  }

  async createGitRepository(gitRepository: GitRepository, project: string) {
    log.debug(
      `[GitRepositoryApi.createGitRepository] ${gitRepository.name}, project[${project}]`
    )
    const api = await this.getApi()
    return api.createRepository(gitRepository, project)
  }

  async updateGitRepository(gitRepository: GitRepository, project: string) {
    log.debug(
      `[GitRepositoryApi.updateGitRepository] ${gitRepository.name}, project[${project}]`
    )
    const api = await this.getApi()
    return api.updateRepository(gitRepository, gitRepository.id!, project)
  }

  async deleteGitRepository(id: string, project: string) {
    log.debug(
      `[GitRepositoryApi.deleteGitRepository] id[${id}], project[${project}]`
    )
    const api = await this.getApi()
    return api.deleteRepository(id, project)
  }
}

const gitRepositoryApi = new GitRepositoryApi()

export { GitRepositoryApi, gitRepositoryApi }
