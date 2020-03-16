import log from 'loglevel'
import { Action, GetArguments } from '../../core/actions/model'
import { ActionProcessor, TransformedDefinition } from '../../core/model'
import { buildApi } from '../adapters/build-api'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'

class GetAllBuildDefinitions implements ActionProcessor {

  canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
    return transformedDefinition instanceof AzureBuildDefinition && action === Action.GET && !args.name
  }

  async process(azureBuildDefinition: AzureBuildDefinition, _action: Action, _args: GetArguments): Promise<GetBuildDefinitionProcessResult> {
    log.debug(`[GetAllBuildDefinitions] ${JSON.stringify(azureBuildDefinition)}`)
    const api = buildApi
    const project = azureBuildDefinition.project
    try {
      const buildDefinitions = await api.findAllBuildDefinitions(project)
      if (buildDefinitions) {
        return new GetBuildDefinitionProcessResult(buildDefinitions)
      }
      else {
        return { buildDefinitions: [] }
      }
    }
    catch (e) {
      return { error: e }
    }
  }
}

export { GetAllBuildDefinitions }

