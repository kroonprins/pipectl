import { Action, GetArguments } from 'pipectl-core/dist/actions/model'
import { ActionProcessor, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { buildApi } from '../adapters/build-api'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'

class GetOneBuildDefinition implements ActionProcessor {

  canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
    return transformedDefinition instanceof AzureBuildDefinition && action === Action.GET && !!args.name
  }

  async process(azureBuildDefinition: AzureBuildDefinition, _action: Action, args: GetArguments): Promise<GetBuildDefinitionProcessResult> {
    log.debug(`[GetOneBuildDefinition] ${JSON.stringify(azureBuildDefinition)}`)
    try {
      const project = azureBuildDefinition.project
      const buildDefinition = await buildApi.findBuildDefinitionById(Number(args.name), project)
      if (buildDefinition) {
        return new GetBuildDefinitionProcessResult([buildDefinition])
      } else {
        return { error: new Error(`Build definition '${args.name}' does not exist in project '${project}'.`) }
      }
    } catch (e) {
      return { error: e }
    }
  }
}

export { GetOneBuildDefinition }

