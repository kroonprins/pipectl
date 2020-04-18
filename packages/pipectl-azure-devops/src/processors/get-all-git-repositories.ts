import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { gitRepositoryApi } from '../adapters/git-repository-api'
import { AzureGitRepository } from '../model/azure-git-repository'
import { GetGitRepositoryProcessResult } from '../model/get-git-repository-process-result'

class GetAllGitRepositories implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureGitRepository &&
      action === Action.GET &&
      !args.name
    )
  }

  async process(
    azureGitRepository: AzureGitRepository,
    _action: Action,
    _args: GetArguments
  ): Promise<GetGitRepositoryProcessResult> {
    log.debug(`[GetAllGitRepositories] ${JSON.stringify(azureGitRepository)}`)
    try {
      const project = azureGitRepository.project
      const gitRepositorys = await gitRepositoryApi.findAllGitRepositories(
        project
      )
      if (gitRepositorys) {
        return new GetGitRepositoryProcessResult(gitRepositorys)
      } else {
        return new GetGitRepositoryProcessResult([])
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllGitRepositories }
