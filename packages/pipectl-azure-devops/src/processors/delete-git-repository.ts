import { Action, ApplyArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ActionProcessor,
  ProcessResult,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { gitRepositoryApi } from '../adapters/git-repository-api'
import { AzureGitRepository } from '../model/azure-git-repository'

class DeleteGitRepository implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    _args: ApplyArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureGitRepository &&
      action === Action.DELETE
    )
  }

  async process(
    azureGitRepository: AzureGitRepository,
    _action: Action,
    args: ApplyArguments
  ): Promise<ProcessResult> {
    log.debug(`[DeleteGitRepository] ${JSON.stringify(azureGitRepository)}`)
    const gitRepository = azureGitRepository.spec
    const project = azureGitRepository.project
    const id = gitRepository.id

    let existingGitRepository: GitRepository | undefined
    if (id) {
      existingGitRepository = await gitRepositoryApi.findGitRepositoryById(
        id,
        project
      )
    } else {
      existingGitRepository = await gitRepositoryApi.findGitRepositoryByName(
        gitRepository.name!,
        project
      )
    }
    if (existingGitRepository) {
      if (args.dryRun) {
        return {
          info: `Git repository ${gitRepository.name} deletion skipped because dry run.`,
        }
      } else {
        try {
          await gitRepositoryApi.deleteGitRepository(
            existingGitRepository.id!,
            project
          )
          return {
            info: `Successfully deleted git repository ${existingGitRepository.id} (${existingGitRepository.name})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      return {
        info: `Git repository ${gitRepository.name} not deleted because it does not exist.`,
      }
    }
  }
}

export { DeleteGitRepository }
