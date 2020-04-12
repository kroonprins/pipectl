import { BuildDefinition } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'
import { GetReporter } from './get-reporter'

class GetBuildDefinitionReporter extends GetReporter<GetBuildDefinitionProcessResult, AzureBuildDefinition, BuildDefinition> {
  constructor() { super(GetBuildDefinitionProcessResult) }

  columns(): string[] {
    return ['NAME', 'DESCRIPTION']
  }

  line(buildDefinition: BuildDefinition): { [column: string]: string } {
    return {
      'NAME': buildDefinition.id!.toString(),
      'DESCRIPTION': `${buildDefinition.path}\\${buildDefinition.name}`,
    }
  }
}

export { GetBuildDefinitionReporter }



