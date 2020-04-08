import { Action, CommonArguments, GetArguments } from 'pipectl-core/dist/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'
import { transformGetReleaseDefinitionProcessResultForReporting } from './util'

class GetReleaseDefinitionJsonReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetReleaseDefinitionProcessResult && args.output === 'json'
  }

  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.debug(`[GetReleaseDefinitionJsonReporter] processResult[${JSON.stringify(processResult)}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`)
    log.info(JSON.stringify(transformGetReleaseDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args as GetArguments), undefined, 4))
  }
}

export { GetReleaseDefinitionJsonReporter }

