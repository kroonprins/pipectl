import { ProcessResult } from "../../core/model"
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"

class GetReleaseDefinitionProcessResult extends ProcessResult {
  constructor(public releaseDefinitions?: ReleaseDefinition[]) { super() }
}

export {
  GetReleaseDefinitionProcessResult
}
