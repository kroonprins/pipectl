import { log } from '@kroonprins/pipectl/dist/util/logging'
import { ICoreApi } from 'azure-devops-node-api/CoreApi'
import memoize from 'p-memoize'
import { azureConnection } from './connection'

class UserApi {
  private _userApi: ICoreApi | null = null

  private async getApi(): Promise<ICoreApi> {
    if (!this._userApi) {
      log.debug('Initializing UserAPI')
      this._userApi = await azureConnection.get().getCoreApi()
      log.debug('Initialized UserAPI')
    }
    return this._userApi
  }

  findUserIdByName = memoize(this._findUserIdByName, {
    cacheKey: JSON.stringify,
  })

  private async _findUserIdByName(
    name: string,
    project: string
  ): Promise<string> {
    log.debug(
      `[UserApi._findUserIdByName] name[${name}] and project ${project}`
    )
    const api = await this.getApi()
    const teams = await api.getTeams(project)
    const teamMembers = (
      await Promise.all(
        teams.map((team) =>
          api.getTeamMembersWithExtendedProperties(project, team.id!)
        )
      )
    ).flat()
    const teamMember = teamMembers.find(
      (member) =>
        member.identity?.displayName?.toLowerCase() === name.toLowerCase() ||
        member.identity?.uniqueName?.toLowerCase() === name.toLowerCase()
    )
    if (teamMember) {
      log.debug(
        `[UserApi._findUserIdByName] found ${teamMember.identity!
          .id!} for name[${name}] and project ${project}`
      )
      return teamMember.identity!.id!
    }
    throw new Error(
      `User with name ${name} not found. It either doesn't exist or you do not have the required access for it.`
    )
  }
}

const userApi = new UserApi()

export { UserApi, userApi }
