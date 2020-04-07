import { BuildDefinition } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { ProcessResult } from 'pipectl-core/dist/model'

class GetBuildDefinitionProcessResult extends ProcessResult {
  constructor(public buildDefinitions?: BuildDefinition[]) { super() }
}

export { GetBuildDefinitionProcessResult }

