import log from 'loglevel'
import { Action, CommonArguments } from '../../core/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from '../../core/model'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'
import { transformGetBuildDefinitionProcessResultForReporting } from './util'

class GetBuildDefinitionJsonReporter implements Reporter {
  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetBuildDefinitionProcessResult && args.output === 'json'
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.info(JSON.stringify(transformGetBuildDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args), undefined, 4))
  }
}

export { GetBuildDefinitionJsonReporter }

