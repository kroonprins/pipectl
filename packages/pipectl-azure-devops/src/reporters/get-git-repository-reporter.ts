import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { AzureGitRepository } from '../model/azure-git-repository'
import { GetGitRepositoryProcessResult } from '../model/get-git-repository-process-result'
import { GetReporter } from './get-reporter'

class GetGitRepositoryReporter extends GetReporter<
  GetGitRepositoryProcessResult,
  AzureGitRepository,
  GitRepository
> {
  constructor() {
    super(GetGitRepositoryProcessResult)
  }

  columns(): string[] {
    return ['NAME', 'DESCRIPTION']
  }

  line(gitRepository: GitRepository): { [column: string]: string } {
    return {
      NAME: gitRepository.id!.toString(),
      DESCRIPTION: gitRepository.name!,
    }
  }
}

export { GetGitRepositoryReporter }
