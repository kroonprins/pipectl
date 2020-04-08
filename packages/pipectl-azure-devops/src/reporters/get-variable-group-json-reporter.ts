import { Action, CommonArguments, GetArguments } from 'pipectl-core/dist/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { GetVariableGroupProcessResult } from '../model/get-variable-group-process-result'
import { transformGetVariableGroupProcessResultForReporting } from './util'

class GetVariableGroupJsonReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetVariableGroupProcessResult && args.output === 'json'
  }

  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.debug(`[GetVariableGroupJsonReporter] processResult[${JSON.stringify(processResult)}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`)
    log.info(JSON.stringify(transformGetVariableGroupProcessResultForReporting(processResult, transformedDefinition, action, args as GetArguments), undefined, 4))
  }
}

export { GetVariableGroupJsonReporter }

