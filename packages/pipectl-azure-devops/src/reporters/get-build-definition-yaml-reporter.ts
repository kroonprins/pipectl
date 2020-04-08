import { safeDump } from 'js-yaml'
import { Action, CommonArguments, GetArguments } from 'pipectl-core/dist/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'
import { transformGetBuildDefinitionProcessResultForReporting } from './util'

class GetBuildDefinitionYamlReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetBuildDefinitionProcessResult && args.output === 'yaml'
  }

  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.debug(`[GetBuildDefinitionYamlReporter] processResult[${JSON.stringify(processResult)}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`)
    log.info(safeDump(transformGetBuildDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args as GetArguments)))
  }
}

export { GetBuildDefinitionYamlReporter }

