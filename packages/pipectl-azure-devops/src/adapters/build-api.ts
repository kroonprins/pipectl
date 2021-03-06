import { log } from '@kroonprins/pipectl/dist/util/logging'
import { IBuildApi } from 'azure-devops-node-api/BuildApi'
import { BuildDefinition } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { azureConnection } from './connection'

class BuildApi {
  private _buildApi: IBuildApi | null = null

  private async getApi(): Promise<IBuildApi> {
    if (!this._buildApi) {
      log.debug('Initializing BuildAPI')
      this._buildApi = await azureConnection.get().getBuildApi()
      log.debug('Initialized BuildAPI')
    }
    return this._buildApi
  }

  async findBuildDefinitionByNameAndPath(
    name: string,
    path: string,
    project: string
  ): Promise<BuildDefinition | null> {
    log.debug(
      `[BuildApi.findBuildDefinitionByNameAndPath] name[${name}], path[${path}], project[${project}]`
    )
    const api = await this.getApi()
    const search = await api.getDefinitions(
      project,
      name,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      path,
      undefined,
      undefined,
      true,
      false,
      undefined,
      undefined,
      undefined
    )
    if (search && search.length) {
      log.debug(
        `[BuildApi.findBuildDefinitionByNameAndPath] found ${search[0].id} (${search.length}) for name[${name}], path[${path}], project[${project}]`
      )
      return this.setTags(search[0], project)
    }
    log.debug(
      `[BuildApi.findBuildDefinitionByNameAndPath] not found for name[${name}], path[${path}], project[${project}]`
    )
    return null
  }

  async findBuildDefinitionById(id: number, project: string) {
    log.debug(
      `[BuildApi.findBuildDefinitionById] id[${id}], project[${project}]`
    )
    const api = await this.getApi()
    const buildDefinition = await api.getDefinition(project, id)
    return this.setTags(buildDefinition, project)
  }

  async findAllBuildDefinitions(project: string): Promise<BuildDefinition[]> {
    log.debug(`[BuildApi.findAllBuildDefinitions] project[${project}]`)
    const api = await this.getApi()
    return Promise.all(
      (
        await api.getDefinitions(
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
          true,
          false,
          undefined,
          undefined,
          undefined
        )
      ).map((buildDefinition) => this.setTags(buildDefinition, project))
    )
  }

  async createBuildDefinition(
    buildDefinition: BuildDefinition,
    project: string
  ) {
    log.debug(
      `[BuildApi.createBuildDefinition] ${buildDefinition.path}\\${buildDefinition.name}, project[${project}]`
    )
    const api = await this.getApi()
    const createdBuildDefinition = await api.createDefinition(
      buildDefinition,
      project
    )
    if (buildDefinition.tags && buildDefinition.tags.length) {
      log.debug(
        `[BuildApi.createBuildDefinition] add tags ${JSON.stringify(
          buildDefinition.tags
        )}`
      )
      await api.addBuildTags(
        buildDefinition.tags,
        project,
        createdBuildDefinition.id!
      )
    }
    return { ...createdBuildDefinition, tags: buildDefinition.tags }
  }

  async updateBuildDefinition(
    buildDefinition: BuildDefinition,
    project: string
  ) {
    log.debug(
      `[BuildApi.updateBuildDefinition] ${buildDefinition.path}\\${buildDefinition.name}, project[${project}]`
    )
    const api = await this.getApi()
    const updatedBuildDefinition = await api.updateDefinition(
      buildDefinition,
      project,
      buildDefinition.id!
    )
    if (buildDefinition.tags && buildDefinition.tags.length) {
      const currentTags =
        (await api.getBuildTags(project, buildDefinition.id!)) || []
      const tagsToAdd = buildDefinition.tags.filter(
        (x) => !currentTags.includes(x)
      )
      log.debug(
        `[BuildApi.updateBuildDefinition] tags to add ${JSON.stringify(
          tagsToAdd
        )}`
      )
      const tagsToRemove = currentTags.filter(
        (x) => !buildDefinition.tags!.includes(x)
      )
      log.debug(
        `[BuildApi.updateBuildDefinition] tags to remove ${JSON.stringify(
          tagsToRemove
        )}`
      )
      await Promise.all([
        api.addBuildTags(tagsToAdd, project, buildDefinition.id!),
        ...tagsToRemove.map((tag) =>
          api.deleteBuildTag(project, buildDefinition.id!, tag)
        ),
      ])
    }
    return { ...updatedBuildDefinition, tags: buildDefinition.tags }
  }

  async deleteBuildDefinition(buildDefinitionId: number, project: string) {
    log.debug(
      `[BuildApi.deleteBuildDefinition] id[${buildDefinitionId}], project[${project}]`
    )
    const api = await this.getApi()
    return api.deleteDefinition(project, buildDefinitionId)
  }

  private async setTags(
    buildDefinition: BuildDefinition,
    project: string
  ): Promise<BuildDefinition> {
    const api = await this.getApi()
    return {
      ...buildDefinition,
      tags: await api.getBuildTags(project, buildDefinition.id!),
    }
  }
}

const buildApi = new BuildApi()

export { BuildApi, buildApi }
