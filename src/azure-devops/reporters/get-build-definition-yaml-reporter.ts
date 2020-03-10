import { safeDump } from "js-yaml"
import { Action, CommonArguments } from "../../core/actions/model"
import { ProcessResult, Reporter, TransformedDefinition } from "../../core/model"
import { GetBuildDefinitionProcessResult } from "../model/get-build-definition-process-result"
import { transformGetBuildDefinitionProcessResultForReporting } from "./util"

/* tslint:disable:no-console */ // TODO
class GetBuildDefinitionYamlReporter implements Reporter {
  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetBuildDefinitionProcessResult && args.output === "yaml"
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    console.log(safeDump(transformGetBuildDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args)))
  }
}

export { GetBuildDefinitionYamlReporter }

