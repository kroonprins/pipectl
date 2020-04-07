import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { ProcessResult } from 'pipectl-core/dist/model'

class GetReleaseDefinitionProcessResult extends ProcessResult {
  constructor(public releaseDefinitions?: ReleaseDefinition[]) { super() }
}

export { GetReleaseDefinitionProcessResult }

