import { safeDump } from 'js-yaml'
import { Action, CommonArguments, GetArguments } from 'pipectl-core/dist/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'
import { transformGetReleaseDefinitionProcessResultForReporting } from './util'

class GetReleaseDefinitionYamlReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetReleaseDefinitionProcessResult && args.output === 'yaml'
  }

  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.debug(`[GetReleaseDefinitionYamlReporter] processResult[${JSON.stringify(processResult)}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`)
    log.info(safeDump(transformGetReleaseDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args as GetArguments)))
  }
}

export { GetReleaseDefinitionYamlReporter }

