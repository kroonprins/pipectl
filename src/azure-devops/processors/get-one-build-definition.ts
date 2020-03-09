import { ActionProcessor, TransformedDefinition } from "../../core/model"
import { Action, GetArguments } from "../../core/actions/model"
import { buildApi } from "../adapters/build-api"
import { GetBuildDefinitionProcessResult } from "../model/get-build-definition-process-result"
import { AzureBuildDefinition } from "../model/azure-build-definition"

class GetOneBuildDefinition implements ActionProcessor {
  canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
    return transformedDefinition instanceof AzureBuildDefinition && action === Action.GET && !!args.name
  }
  async process(azureReleaseDefinition: AzureBuildDefinition, action: Action, args: GetArguments): Promise<GetBuildDefinitionProcessResult> {
    const api = buildApi
    const project = azureReleaseDefinition.project
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

export {
  GetOneBuildDefinition,
}
