import { BuildDefinition } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { ProcessResult } from 'pipectl-core/src/model'

class GetBuildDefinitionProcessResult extends ProcessResult {
  constructor(public buildDefinitions?: BuildDefinition[]) { super() }
}

export { GetBuildDefinitionProcessResult }
