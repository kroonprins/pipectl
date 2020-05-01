import { TaskGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { AzureDefinition } from '.'

class AzureTaskGroup extends AzureDefinition<TaskGroup> {
  static SEPARATOR: string = '/'

  uniqueId(): string {
    return `${this.kind}${this.project}${this.spec.name}${this.spec.version?.major}${this.spec.version?.minor}${this.spec.version?.patch}`
  }
  shortName(): string {
    return `kind[${this.kind}], project[${this.project}, name[${this.spec.name}], id[${this.spec.id}], version[${this.spec.version?.major}.${this.spec.version?.minor}.${this.spec.version?.patch}], isTest[${this.spec.version?.isTest}]`
  }
}

export { AzureTaskGroup }
