import { VariableGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { Kind } from '../model'
import { GetReporter } from './get-reporter'

class GetVariableGroupReporter extends GetReporter<VariableGroup> {
  constructor() {
    super(Kind.VARIABLE_GROUP)
  }

  columns(): string[] {
    return ['NAME', 'DESCRIPTION']
  }

  line(variableGroup: VariableGroup): { [column: string]: string } {
    return {
      NAME: variableGroup.id!.toString(),
      DESCRIPTION: variableGroup.name!,
    }
  }
}

export { GetVariableGroupReporter }
