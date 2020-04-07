import { Action, CommonArguments } from 'pipectl-core/dist/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'

class GetBuildDefinitionReporter implements Reporter {

  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetBuildDefinitionProcessResult && !args.output
  }

  async report(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, _args: CommonArguments): Promise<void> {
    log.debug(`[GetBuildDefinitionReporter] processResult[${JSON.stringify(processResult)}]`)
    const getBuildDefinitionProcessResult = processResult as GetBuildDefinitionProcessResult
    log.info('NAME\tDESCRIPTON')
    getBuildDefinitionProcessResult.buildDefinitions!.forEach(buildDefinition => {
      log.info(`${buildDefinition.id}\t${buildDefinition.path}\\${buildDefinition.name}`)
    })
  }
}

export { GetBuildDefinitionReporter }

