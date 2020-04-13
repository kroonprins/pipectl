import { VariableGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { AzureVariableGroup } from '../model/azure-variable-group'
import { GetVariableGroupProcessResult } from '../model/get-variable-group-process-result'
import { GetReporter } from './get-reporter'

class GetVariableGroupReporter extends GetReporter<
  GetVariableGroupProcessResult,
  AzureVariableGroup,
  VariableGroup
> {
  constructor() {
    super(GetVariableGroupProcessResult)
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
