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

class ApplyGitRepository implements ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    _args: ApplyArguments
  ): boolean {
    return (
      transformedDefinition instanceof AzureGitRepository &&
      action === Action.APPLY
    )
  }

  async process(
    azureGitRepository: AzureGitRepository,
    _action: Action,
    args: ApplyArguments
  ): Promise<ProcessResult> {
    log.debug(`[ApplyGitRepository] ${JSON.stringify(azureGitRepository)}`)
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
      gitRepository.id = existingGitRepository.id
      if (args.dryRun) {
        return {
          info: `Git repository ${gitRepository.name} update skipped because dry run.`,
        }
      } else {
        try {
          await gitRepositoryApi.updateGitRepository(gitRepository, project)
          return {
            info: `Successfully updated git repository ${existingGitRepository.id} (${existingGitRepository.name})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    } else {
      if (args.dryRun) {
        return {
          info: `Git repository ${gitRepository.name} creation skipped because dry run.`,
        }
      } else {
        try {
          const createdGitRepository = await gitRepositoryApi.createGitRepository(
            gitRepository,
            project
          )
          return {
            info: `Successfully created git repository ${createdGitRepository.id} (${createdGitRepository.name})`,
          }
        } catch (e) {
          return { error: e }
        }
      }
    }
  }
}

export { ApplyGitRepository }
