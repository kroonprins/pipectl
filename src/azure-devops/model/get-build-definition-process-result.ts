import { ProcessResult } from "../../core/model"
import { BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces"

class GetBuildDefinitionProcessResult extends ProcessResult {
  constructor(public buildDefinitions?: BuildDefinition[]) { super() }
}

export {
  GetBuildDefinitionProcessResult
}
