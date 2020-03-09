import { Reporter, ProcessResult, TransformedDefinition, Definition } from "../../core/model"
import { Action, CommonArguments } from "../../core/actions/model"
import { GetReleaseDefinitionProcessResult } from "../model/get-release-definition-process-result"
import { safeDump } from "js-yaml"
import { transformGetReleaseDefinitionProcessResultForReporting } from "./util"

/* tslint:disable:no-console */ // TODO
class GetReleaseDefinitionYamlReporter implements Reporter {
  canReport(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetReleaseDefinitionProcessResult && args.output === "yaml"
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    console.log(safeDump(transformGetReleaseDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args)))
  }
}

export {
  GetReleaseDefinitionYamlReporter,
}
