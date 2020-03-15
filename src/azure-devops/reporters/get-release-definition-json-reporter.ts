import log from 'loglevel'
import { Action, CommonArguments } from '../../core/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from '../../core/model'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'
import { transformGetReleaseDefinitionProcessResultForReporting } from './util'

class GetReleaseDefinitionJsonReporter implements Reporter {
  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetReleaseDefinitionProcessResult && args.output === 'json'
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.info(JSON.stringify(transformGetReleaseDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args), undefined, 4))
  }
}

export { GetReleaseDefinitionJsonReporter }

