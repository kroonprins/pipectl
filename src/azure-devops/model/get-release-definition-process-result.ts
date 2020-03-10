import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { ProcessResult } from "../../core/model"

class GetReleaseDefinitionProcessResult extends ProcessResult {
  constructor(public releaseDefinitions?: ReleaseDefinition[]) { super() }
}

export { GetReleaseDefinitionProcessResult }
