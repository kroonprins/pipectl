import log from 'loglevel'
import { Action, CommonArguments } from '../../core/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from '../../core/model'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'

class GetReleaseDefinitionReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetReleaseDefinitionProcessResult && !args.output
  }

  async report(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, _args: CommonArguments): Promise<void> {
    log.debug(`[GetReleaseDefinitionReporter] processResult[${JSON.stringify(processResult)}]`)
    const getReleaseDefinitionProcessResult = processResult as GetReleaseDefinitionProcessResult
    log.info('NAME\tDESCRIPTON')
    getReleaseDefinitionProcessResult.releaseDefinitions!.forEach(releaseDefinition => {
      log.info(`${releaseDefinition.id}\t${releaseDefinition.path}\\${releaseDefinition.name}`)
    })
  }
}

export { GetReleaseDefinitionReporter }

