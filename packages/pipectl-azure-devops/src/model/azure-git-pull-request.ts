import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { AzureDefinition } from '.'

class AzureGitPullRequest extends AzureDefinition<GitPullRequest> {
  static SEPARATOR: string = '/'

  uniqueId(): string {
    return `${this.kind}${this.project}${this.spec.repository?.id}${this.spec.title}${this.spec.sourceRefName}${this.spec.targetRefName}`
  }
  shortName(): string {
    return `kind[${this.kind}], project[${this.project}, repository[${this.spec.repository?.id}], id[${this.spec.pullRequestId}], title[${this.spec.title}], sourceRef[${this.spec.sourceRefName}], targetRef[${this.spec.targetRefName}]`
  }
}

export { AzureGitPullRequest }
