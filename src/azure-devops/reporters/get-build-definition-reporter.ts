import { Action, CommonArguments } from "../../core/actions/model"
import { ProcessResult, Reporter, TransformedDefinition } from "../../core/model"
import { GetBuildDefinitionProcessResult } from "../model/get-build-definition-process-result"

/* tslint:disable:no-console */ // TODO
class GetBuildDefinitionReporter implements Reporter {
  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetBuildDefinitionProcessResult && !args.output
  }
  async report(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, _args: CommonArguments): Promise<void> {
    const getBuildDefinitionProcessResult = processResult as GetBuildDefinitionProcessResult
    console.log('NAME\tDESCRIPTON')
    getBuildDefinitionProcessResult.buildDefinitions!.forEach(buildDefinition => {
      console.log(`${buildDefinition.id}\t${buildDefinition.path}\\${buildDefinition.name}`)
    })
  }
}

export { GetBuildDefinitionReporter }

