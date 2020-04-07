import { Action, GetArguments } from 'pipectl-core/src/actions/model'
import { ActionProcessor, TransformedDefinition } from 'pipectl-core/src/model'
import { log } from 'pipectl-core/src/util/logging'
import { releaseApi } from '../adapters/release-api'
import { AzureReleaseDefinition } from '../model/azure-release-definition'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'

class GetAllReleaseDefinitions implements ActionProcessor {

  canProcess(transformedDefinition: TransformedDefinition, action: Action, args: GetArguments): boolean {
    return transformedDefinition instanceof AzureReleaseDefinition && action === Action.GET && !args.name
  }

  async process(azureReleaseDefinition: AzureReleaseDefinition, _action: Action, _args: GetArguments): Promise<GetReleaseDefinitionProcessResult> {
    log.debug(`[GetAllReleaseDefinitions] ${JSON.stringify(azureReleaseDefinition)}`)
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

