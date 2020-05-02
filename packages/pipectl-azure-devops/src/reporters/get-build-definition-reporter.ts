import { BuildDefinition } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { Kind } from '../model'
import { GetReporter } from './get-reporter'

class GetBuildDefinitionReporter extends GetReporter<BuildDefinition> {
  constructor() {
    super(Kind.BUILD_DEFINITION)
  }

  columns(): string[] {
    return ['NAME', 'DESCRIPTION']
  }

  line(buildDefinition: BuildDefinition): { [column: string]: string } {
    return {
      NAME: buildDefinition.id!.toString(),
      DESCRIPTION: `${buildDefinition.path}\\${buildDefinition.name}`,
    }
  }
}

export { GetBuildDefinitionReporter }
