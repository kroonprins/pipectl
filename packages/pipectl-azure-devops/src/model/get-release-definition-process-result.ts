import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { GetProcessResult } from './get-process-result'

class GetReleaseDefinitionProcessResult extends GetProcessResult<
  ReleaseDefinition
> {}

export { GetReleaseDefinitionProcessResult }
