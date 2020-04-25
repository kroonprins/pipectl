import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { AzureDefinition } from '.'

class AzureGitPullRequest extends AzureDefinition<GitPullRequest> {
  uniqueId(): string {
    return `${this.kind}${this.project}${this.spec.repository?.id}${this.spec.pullRequestId}`
  }
  shortName(): string {
    return `kind[${this.kind}], project[${this.project}, repository[${this.spec.repository?.name}], id[${this.spec.pullRequestId}]`
  }
}

export { AzureGitPullRequest }
