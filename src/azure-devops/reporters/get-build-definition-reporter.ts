import { Reporter, ProcessResult, TransformedDefinition } from "../../core/model"
import { Action, CommonArguments } from "../../core/actions/model"
import { GetBuildDefinitionProcessResult } from "../model/get-build-definition-process-result"

/* tslint:disable:no-console */ // TODO
class GetBuildDefinitionReporter implements Reporter {
  canReport(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetBuildDefinitionProcessResult && !args.output
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    const getBuildDefinitionProcessResult = processResult as GetBuildDefinitionProcessResult
    console.log('NAME\tDESCRIPTON')
    getBuildDefinitionProcessResult.buildDefinitions!.forEach(buildDefinition => {
      console.log(`${buildDefinition.id}\t${buildDefinition.path}\\${buildDefinition.name}`)
    })
  }
}

export {
  GetBuildDefinitionReporter,
}
