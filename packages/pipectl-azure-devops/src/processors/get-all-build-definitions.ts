import { Action, GetArguments } from '@kroonprins/pipectl-core/dist/actions/model'
import { ActionProcessor, TransformedDefinition } from '@kroonprins/pipectl-core/dist/model'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import { buildApi } from '../adapters/build-api'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'

class GetAllBuildDefinitions implements ActionProcessor {

  canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
    return transformedDefinition instanceof AzureBuildDefinition && action === Action.GET && !args.name
  }

  async process(azureBuildDefinition: AzureBuildDefinition, _action: Action, _args: GetArguments): Promise<GetBuildDefinitionProcessResult> {
    log.debug(`[GetAllBuildDefinitions] ${JSON.stringify(azureBuildDefinition)}`)
    try {
      const project = azureBuildDefinition.project
      const buildDefinitions = await buildApi.findAllBuildDefinitions(project)
      if (buildDefinitions) {
        return new GetBuildDefinitionProcessResult(buildDefinitions)
      } else {
        return new GetBuildDefinitionProcessResult([])
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetAllBuildDefinitions }

