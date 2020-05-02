import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { gitRepositoryApi } from '../adapters/git-repository-api'
import { AzureGitRepository } from '../model/azure-git-repository'

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
  ): Promise<ProcessResult> {
    log.debug(`[GetAllGitRepositories] ${JSON.stringify(azureGitRepository)}`)
    try {
      const project = azureGitRepository.project
      const gitRepositories = await gitRepositoryApi.findAllGitRepositories(
        project
      )
      if (gitRepositories) {
        return {
          results: gitRepositories.map((gitRepository) => {
            return {
              apiVersion: azureGitRepository.apiVersion,
              kind: azureGitRepository.kind,
              metadata: {
                namespace: azureGitRepository.project,
                labels: {},
              },
              spec: gitRepository,
            }
          }),
          properties: { type: azureGitRepository.kind },
        }
      } else {
        return { results: [], properties: { type: azureGitRepository.kind } }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllGitRepositories }
