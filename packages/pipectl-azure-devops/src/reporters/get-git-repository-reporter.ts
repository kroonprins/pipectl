import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { Kind } from '../model'
import { GetReporter } from './get-reporter'

class GetGitRepositoryReporter extends GetReporter<GitRepository> {
  constructor() {
    super(Kind.GIT_REPOSITORY)
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
