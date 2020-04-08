import { VariableGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { ProcessResult } from 'pipectl-core/dist/model'

class GetVariableGroupProcessResult extends ProcessResult { // TODO generics to avoid duplication
  constructor(public variableGroups?: VariableGroup[]) { super() }
}

export { GetVariableGroupProcessResult }

