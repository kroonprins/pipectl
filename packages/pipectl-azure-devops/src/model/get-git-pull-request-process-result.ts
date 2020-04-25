import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { GetProcessResult } from './get-process-result'

class GetGitPullRequestProcessResult extends GetProcessResult<GitPullRequest> {}

export { GetGitPullRequestProcessResult }
