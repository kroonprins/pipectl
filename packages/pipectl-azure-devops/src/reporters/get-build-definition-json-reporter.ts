import { log } from 'pipectl-core/src/util/logging'
import { Action, CommonArguments } from 'pipectl-core/src/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/src/model'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'
import { transformGetBuildDefinitionProcessResultForReporting } from './util'

class GetBuildDefinitionJsonReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetBuildDefinitionProcessResult && args.output === 'json'
  }

  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.debug(`[GetBuildDefinitionJsonReporter] processResult[${JSON.stringify(processResult)}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`)
    log.info(JSON.stringify(transformGetBuildDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args), undefined, 4))
  }
}

export { GetBuildDefinitionJsonReporter }

