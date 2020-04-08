import { Action, CommonArguments } from 'pipectl-core/dist/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { GetVariableGroupProcessResult } from '../model/get-variable-group-process-result'

class GetVariableGroupReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetVariableGroupProcessResult && !args.output
  }

  async report(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, _args: CommonArguments): Promise<void> {
    log.debug(`[GetVariableGroupReporter] processResult[${JSON.stringify(processResult)}]`)
    const getVariableGroupProcessResult = processResult as GetVariableGroupProcessResult
    log.info('NAME\tDESCRIPTON')
    getVariableGroupProcessResult.variableGroups!.forEach(variableGroup => {
      log.info(`${variableGroup.id}\t${variableGroup.name}`)
    })
  }
}

export { GetVariableGroupReporter }

