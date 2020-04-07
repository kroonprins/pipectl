import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { ProcessResult } from 'pipectl-core/src/model'

class GetReleaseDefinitionProcessResult extends ProcessResult {
  constructor(public releaseDefinitions?: ReleaseDefinition[]) { super() }
}

export { GetReleaseDefinitionProcessResult }

