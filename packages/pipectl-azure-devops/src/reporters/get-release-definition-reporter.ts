import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { Kind } from '../model'
import { GetReporter } from './get-reporter'

class GetReleaseDefinitionReporter extends GetReporter<ReleaseDefinition> {
  constructor() {
    super(Kind.RELEASE_DEFINITION)
  }

  columns(): string[] {
    return ['NAME', 'DESCRIPTION']
  }

  line(releaseDefinition: ReleaseDefinition): { [column: string]: string } {
    return {
      NAME: releaseDefinition.id!.toString(),
      DESCRIPTION: `${releaseDefinition.path}\\${releaseDefinition.name}`,
    }
  }
}

export { GetReleaseDefinitionReporter }
