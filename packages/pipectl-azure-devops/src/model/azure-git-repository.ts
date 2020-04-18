import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { AzureDefinition } from '.'

class AzureGitRepository extends AzureDefinition<GitRepository> {
  uniqueId(): string {
    return `${this.kind}${this.project}${this.spec.name}`
  }
  shortName(): string {
    return `kind[${this.kind}], project[${this.project}, name[${this.spec.name}], id[${this.spec.id}]`
  }
}

export { AzureGitRepository }
