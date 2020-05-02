import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { gitRepositoryApi } from '../adapters/git-repository-api'
import { AzureGitRepository } from '../model/azure-git-repository'

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
  ): Promise<ProcessResult> {
    log.debug(`[GetOneGitRepository] ${JSON.stringify(azureGitRepository)}`)
    try {
      const project = azureGitRepository.project
      const gitRepository = await gitRepositoryApi.findGitRepositoryById(
        args.name!,
        project
      )
      if (gitRepository) {
        return {
          results: [
            {
              apiVersion: azureGitRepository.apiVersion,
              kind: azureGitRepository.kind,
              metadata: {
                namespace: azureGitRepository.project,
                labels: {},
              },
              spec: gitRepository,
            },
          ],
          properties: { type: azureGitRepository.kind },
        }
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
