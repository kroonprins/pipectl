import { Action, GetArguments } from '../../core/actions/model'
import { ActionProcessor, TransformedDefinition } from '../../core/model'
import { releaseApi } from '../adapters/release-api'
import { AzureReleaseDefinition } from '../model/azure-release-definition'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'

class GetOneReleaseDefinition implements ActionProcessor {
  canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
    return transformedDefinition instanceof AzureReleaseDefinition && action === Action.GET && !!args.name
  }
  async process(azureReleaseDefinition: AzureReleaseDefinition, _action: Action, args: GetArguments): Promise<GetReleaseDefinitionProcessResult> {
    const api = releaseApi
    const project = azureReleaseDefinition.project
    try {
      const releaseDefinition = await api.findReleaseDefinitionById(Number(args.name), project)
      if (releaseDefinition) {
        return new GetReleaseDefinitionProcessResult([releaseDefinition])
      }
      else {
        return { error: new Error(`Release definition '${args.name}' does not exist in project '${project}'.`) }
      }
    }
    catch (e) {
      return { error: e }
    }
  }
}

export { GetOneReleaseDefinition }

