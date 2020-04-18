import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { gitRepositoryApi } from '../adapters/git-repository-api'
import { AzureGitRepository } from '../model/azure-git-repository'
import { GetGitRepositoryProcessResult } from '../model/get-git-repository-process-result'

class GetOneGitRepository implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureGitRepository &&
      action === Action.GET &&
      !!args.name
    )
  }

  async process(
    azureGitRepository: AzureGitRepository,
    _action: Action,
    args: GetArguments
  ): Promise<GetGitRepositoryProcessResult> {
    log.debug(`[GetOneGitRepository] ${JSON.stringify(azureGitRepository)}`)
    try {
      const project = azureGitRepository.project
      const gitRepository = await gitRepositoryApi.findGitRepositoryById(
        args.name!,
        project
      )
      if (gitRepository) {
        return new GetGitRepositoryProcessResult([gitRepository])
      } else {
        return {
          error: new Error(
            `Git repository '${args.name}' does not exist in project '${project}'.`
          ),
        }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetOneGitRepository }
