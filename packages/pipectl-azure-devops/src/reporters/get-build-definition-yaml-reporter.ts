import { safeDump } from 'js-yaml'
import { log } from 'pipectl-core/src/util/logging'
import { Action, CommonArguments } from 'pipectl-core/src/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/src/model'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'
import { transformGetBuildDefinitionProcessResultForReporting } from './util'

class GetBuildDefinitionYamlReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetBuildDefinitionProcessResult && args.output === 'yaml'
  }

  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.debug(`[GetBuildDefinitionYamlReporter] processResult[${JSON.stringify(processResult)}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`)
    log.info(safeDump(transformGetBuildDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args)))
  }
}

export { GetBuildDefinitionYamlReporter }

