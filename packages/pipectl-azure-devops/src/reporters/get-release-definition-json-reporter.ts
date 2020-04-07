import { Action, CommonArguments } from 'pipectl-core/src/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/src/model'
import { log } from 'pipectl-core/src/util/logging'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'
import { transformGetReleaseDefinitionProcessResultForReporting } from './util'

class GetReleaseDefinitionJsonReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetReleaseDefinitionProcessResult && args.output === 'json'
  }

  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.debug(`[GetReleaseDefinitionJsonReporter] processResult[${JSON.stringify(processResult)}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`)
    log.info(JSON.stringify(transformGetReleaseDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args), undefined, 4))
  }
}

export { GetReleaseDefinitionJsonReporter }

