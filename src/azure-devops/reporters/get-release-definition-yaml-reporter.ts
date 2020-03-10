import { safeDump } from "js-yaml"
import { Action, CommonArguments } from "../../core/actions/model"
import { ProcessResult, Reporter, TransformedDefinition } from "../../core/model"
import { GetReleaseDefinitionProcessResult } from "../model/get-release-definition-process-result"
import { transformGetReleaseDefinitionProcessResultForReporting } from "./util"

/* tslint:disable:no-console */ // TODO
class GetReleaseDefinitionYamlReporter implements Reporter {
  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetReleaseDefinitionProcessResult && args.output === "yaml"
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    console.log(safeDump(transformGetReleaseDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args)))
  }
}

export { GetReleaseDefinitionYamlReporter }

