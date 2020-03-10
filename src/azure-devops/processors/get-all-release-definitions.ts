import { Action, GetArguments } from "../../core/actions/model"
import { ActionProcessor, TransformedDefinition } from "../../core/model"
import { releaseApi } from "../adapters/release-api"
import { AzureReleaseDefinition } from "../model/azure-release-definition"
import { GetReleaseDefinitionProcessResult } from "../model/get-release-definition-process-result"

class GetAllReleaseDefinitions implements ActionProcessor {
  canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
    return transformedDefinition instanceof AzureReleaseDefinition && action === Action.GET && !args.name
  }
  async process(azureReleaseDefinition: AzureReleaseDefinition, _action: Action, _args: GetArguments): Promise<GetReleaseDefinitionProcessResult> {
    const api = releaseApi
    const project = azureReleaseDefinition.project
    try {
      const releaseDefinitions = await api.findAllReleaseDefinitions(project)
      if (releaseDefinitions) {
        return new GetReleaseDefinitionProcessResult(releaseDefinitions)
      }
      else {
        return { releaseDefinitions: [] }
      }
    }
    catch (e) {
      return { error: e }
    }
  }
}

export { GetAllReleaseDefinitions }

