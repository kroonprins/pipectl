import { Reporter, ProcessResult, TransformedDefinition, Definition } from "../../core/model"
import { Action, CommonArguments } from "../../core/actions/model"
import { GetBuildDefinitionProcessResult } from "../model/get-build-definition-process-result"
import { safeDump } from "js-yaml"
import { transformGetBuildDefinitionProcessResultForReporting } from "./util"

/* tslint:disable:no-console */ // TODO
class GetBuildDefinitionYamlReporter implements Reporter {
  canReport(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetBuildDefinitionProcessResult && args.output === "yaml"
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    console.log(safeDump(transformGetBuildDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args)))
  }
}

export {
  GetBuildDefinitionYamlReporter,
}
