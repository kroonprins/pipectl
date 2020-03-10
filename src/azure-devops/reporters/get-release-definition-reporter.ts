import { Action, CommonArguments } from "../../core/actions/model"
import { ProcessResult, Reporter, TransformedDefinition } from "../../core/model"
import { GetReleaseDefinitionProcessResult } from "../model/get-release-definition-process-result"

/* tslint:disable:no-console */ // TODO
class GetReleaseDefinitionReporter implements Reporter {
  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetReleaseDefinitionProcessResult && !args.output
  }
  async report(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, _args: CommonArguments): Promise<void> {
    const getReleaseDefinitionProcessResult = processResult as GetReleaseDefinitionProcessResult
    console.log('NAME\tDESCRIPTON')
    getReleaseDefinitionProcessResult.releaseDefinitions!.forEach(releaseDefinition => {
      console.log(`${releaseDefinition.id}\t${releaseDefinition.path}\\${releaseDefinition.name}`)
    })
  }
}

export { GetReleaseDefinitionReporter }

