import { Reporter, ProcessResult, TransformedDefinition } from "../../core/model"
import { Action, CommonArguments } from "../../core/actions/model"
import { GetBuildDefinitionProcessResult } from "../model/get-build-definition-process-result"
import { transformGetBuildDefinitionProcessResultForReporting } from "./util"

/* tslint:disable:no-console */ // TODO
class GetBuildDefinitionJsonReporter implements Reporter {
  canReport(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetBuildDefinitionProcessResult && args.output === "json"
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    console.log(JSON.stringify(transformGetBuildDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args), undefined, 4))
  }
}

export {
  GetBuildDefinitionJsonReporter,
}
