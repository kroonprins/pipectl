import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { AzureDefinition } from '.'

class AzureReleaseDefinition extends AzureDefinition<ReleaseDefinition> {
  uniqueId(): string {
    return `${this.kind}${this.project}${this.spec.name}${this.spec.path}`
  }
  shortName(): string {
    return `kind[${this.kind}], project[${this.project}, name[${this.spec.path}\\${this.spec.name}], id[${this.spec.id}]`
  }
}

export { AzureReleaseDefinition }
