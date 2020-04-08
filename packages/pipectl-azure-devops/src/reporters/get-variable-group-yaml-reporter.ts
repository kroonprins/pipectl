import { safeDump } from 'js-yaml'
import { Action, CommonArguments, GetArguments } from 'pipectl-core/dist/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { GetVariableGroupProcessResult } from '../model/get-variable-group-process-result'
import { transformGetVariableGroupProcessResultForReporting } from './util'

class GetVariableGroupYamlReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetVariableGroupProcessResult && args.output === 'yaml'
  }

  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.debug(`[GetVariableGroupYamlReporter] processResult[${JSON.stringify(processResult)}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`)
    log.info(safeDump(transformGetVariableGroupProcessResultForReporting(processResult, transformedDefinition, action, args as GetArguments)))
  }
}

export { GetVariableGroupYamlReporter }

