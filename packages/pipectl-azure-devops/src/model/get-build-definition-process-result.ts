import { BuildDefinition } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { GetProcessResult } from './get-process-result'

class GetBuildDefinitionProcessResult extends GetProcessResult<BuildDefinition> { }

export { GetBuildDefinitionProcessResult }

