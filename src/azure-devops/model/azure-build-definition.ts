import { BuildDefinition } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { AzureDefinition } from '.'

class AzureBuildDefinition extends AzureDefinition<BuildDefinition> {
  uniqueId(): string {
    return `${this.kind}${this.project}${this.spec.name}${this.spec.path}`
  }
}

export { AzureBuildDefinition }
