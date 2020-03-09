import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { AzureDefinition } from "."

class AzureReleaseDefinition extends AzureDefinition<ReleaseDefinition> {
  uniqueId(): string {
    return `${this.kind}${this.project}${this.spec.name}${this.spec.path}`
  }
}

export {
  AzureReleaseDefinition
}
