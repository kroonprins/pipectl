import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { AzureReleaseDefinition } from '../model/azure-release-definition'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'
import { GetReporter } from './get-reporter'

class GetReleaseDefinitionReporter extends GetReporter<GetReleaseDefinitionProcessResult, AzureReleaseDefinition, ReleaseDefinition> {
  constructor() { super(GetReleaseDefinitionProcessResult) }

  columns(): string[] {
    return ['NAME', 'DESCRIPTION']
  }

  line(releaseDefinition: ReleaseDefinition): { [column: string]: string } {
    return {
      'NAME': releaseDefinition.id!.toString(),
      'DESCRIPTION': `${releaseDefinition.path}\\${releaseDefinition.name}`,
    }
  }
}

export { GetReleaseDefinitionReporter }



