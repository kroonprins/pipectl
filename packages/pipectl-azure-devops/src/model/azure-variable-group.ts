
import { VariableGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { AzureDefinition } from '.'

class AzureVariableGroup extends AzureDefinition<VariableGroup> {
  uniqueId(): string {
    return `${this.kind}${this.project}${this.spec.name}`
  }
  shortName(): string {
    return `kind[${this.kind}], project[${this.project}, name[${this.spec.name}], id[${this.spec.id}]`
  }
}

export { AzureVariableGroup }

