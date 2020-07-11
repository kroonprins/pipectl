import { log } from '@kroonprins/pipectl/dist/util/logging'
import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { IReleaseApi } from 'azure-devops-node-api/ReleaseApi'
import { azureConnection } from './connection'

class ReleaseApi {
  private _releaseApi: IReleaseApi | null = null

  private async getApi(): Promise<IReleaseApi> {
    if (!this._releaseApi) {
      log.debug('Initializing ReleaseAPI')
      this._releaseApi = await azureConnection.get().getReleaseApi()
      log.debug('Initialized ReleaseAPI')
    }
    return this._releaseApi
  }

  async findReleaseDefinitionByNameAndPath(
    name: string,
    path: string,
    project: string
  ): Promise<ReleaseDefinition | null> {
    log.debug(
      `[ReleaseApi.findReleaseDefinitionByNameAndPath] name[${name}], path[${path}], project[${project}]`
    )
    const api = await this.getApi()
    const search = await api.getReleaseDefinitions(
      project,
      name,
      undefined,
      undefined,
      undefined,
      1,
      undefined,
      undefined,
      path,
      true,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    )
    if (search && search.length) {
      log.debug(
        `[ReleaseApi.findReleaseDefinitionByNameAndPath] found ${search[0].id} (${search.length}) for name[${name}], path[${path}], project[${project}]`
      )
      return this.setTags(search[0], project)
    }
    log.debug(
      `[ReleaseApi.findReleaseDefinitionByNameAndPath] not found for name[${name}], path[${path}], project[${project}]`
    )
    return null
  }

  async findReleaseDefinitionById(id: number, project: string) {
    log.debug(
      `[ReleaseApi.findReleaseDefinitionById] id[${id}], project[${project}]`
    )
    const api = await this.getApi()
    const releaseDefinition = await api.getReleaseDefinition(project, id)
    return this.setTags(releaseDefinition, project)
  }

  async findAllReleaseDefinitions(project: string) {
    log.debug(`[ReleaseApi.findAllReleaseDefinitions] project[${project}]`)
    const api = await this.getApi()
    return Promise.all(
      (
        await api.getReleaseDefinitions(
          project,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          false,
          undefined
        )
      ).map((releaseDefinition) => this.setTags(releaseDefinition, project))
    )
  }

  async createReleaseDefinition(
    releaseDefinition: ReleaseDefinition,
    project: string
  ) {
    log.debug(
      `[ReleaseApi.createReleaseDefinition] ${releaseDefinition.path}\\${releaseDefinition.name}, project[${project}]`
    )
    const api = await this.getApi()
    const createdReleaseDefinition = await api.createReleaseDefinition(
      releaseDefinition,
      project
    )
    if (releaseDefinition.tags && releaseDefinition.tags.length) {
      log.debug(
        `[ReleaseApi.createReleaseDefinition] add tags ${JSON.stringify(
          releaseDefinition.tags
        )}, project[${project}], release id[${createdReleaseDefinition.id}]`
      )
      await api.addReleaseTags(
        releaseDefinition.tags,
        project,
        createdReleaseDefinition.id!
      )
    }
    return { ...createdReleaseDefinition, tags: releaseDefinition.tags }
  }

  async updateReleaseDefinition(
    releaseDefinition: ReleaseDefinition,
    project: string
  ) {
    log.debug(
      `[ReleaseApi.updateReleaseDefinition] ${releaseDefinition.path}\\${releaseDefinition.name}, project[${project}]`
    )
    const api = await this.getApi()
    const updatedReleaseDefinition = await api.updateReleaseDefinition(
      releaseDefinition,
      project
    )
    if (releaseDefinition.tags && releaseDefinition.tags.length) {
      const currentTags =
        (await api.getDefinitionTags(project, releaseDefinition.id!)) || []
      const tagsToAdd = releaseDefinition.tags.filter(
        (x) => !currentTags.includes(x)
      )
      log.debug(
        `[ReleaseApi.updateReleaseDefinition] tags to add ${JSON.stringify(
          tagsToAdd
        )}`
      )
      const tagsToRemove = currentTags.filter(
        (x) => !releaseDefinition.tags!.includes(x)
      )
      log.debug(
        `[ReleaseApi.updateReleaseDefinition] tags to remove ${JSON.stringify(
          tagsToRemove
        )}`
      )
      await Promise.all([
        api.addDefinitionTags(tagsToAdd, project, releaseDefinition.id!),
        ...tagsToRemove.map((tag) =>
          api.deleteDefinitionTag(project, releaseDefinition.id!, tag)
        ),
      ])
    }
    return { ...updatedReleaseDefinition, tags: releaseDefinition.tags }
  }

  async deleteReleaseDefinition(releaseDefinitionId: number, project: string) {
    log.debug(
      `[ReleaseApi.deleteReleaseDefinition] id[${releaseDefinitionId}], project[${project}]`
    )
    const api = await this.getApi()
    return api.deleteReleaseDefinition(project, releaseDefinitionId)
  }

  private async setTags(
    releaseDefinition: ReleaseDefinition,
    project: string
  ): Promise<ReleaseDefinition> {
    const api = await this.getApi()
    return {
      ...releaseDefinition,
      tags: await api.getDefinitionTags(project, releaseDefinition.id!),
    }
  }
}

const releaseApi = new ReleaseApi()

export { ReleaseApi, releaseApi }
