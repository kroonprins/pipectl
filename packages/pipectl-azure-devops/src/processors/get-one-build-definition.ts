import { log } from 'pipectl-core/src/util/logging'
import { Action, GetArguments } from 'pipectl-core/src/actions/model'
import { ActionProcessor, TransformedDefinition } from 'pipectl-core/src/model'
import { buildApi } from '../adapters/build-api'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'

class GetOneBuildDefinition implements ActionProcessor {

  canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
    return transformedDefinition instanceof AzureBuildDefinition && action === Action.GET && !!args.name
  }

  async process(azureBuildDefinition: AzureBuildDefinition, _action: Action, args: GetArguments): Promise<GetBuildDefinitionProcessResult> {
    log.debug(`[GetOneBuildDefinition] ${JSON.stringify(azureBuildDefinition)}`)
    const api = buildApi
    const project = azureBuildDefinition.project
    try {
      const buildDefinition = await api.findBuildDefinitionById(Number(args.name), project)
      if (buildDefinition) {
        return new GetBuildDefinitionProcessResult([buildDefinition])
      }
      else {
        return { error: new Error(`Build definition '${args.name}' does not exist in project '${project}'.`) }
      }
    }
    catch (e) {
      return { error: e }
    }
  }
}

export { GetOneBuildDefinition }

