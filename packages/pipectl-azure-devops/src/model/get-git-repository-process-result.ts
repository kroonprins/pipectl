import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { GetProcessResult } from './get-process-result'

class GetGitRepositoryProcessResult extends GetProcessResult<GitRepository> {}

export { GetGitRepositoryProcessResult }
