import { safeDump } from "js-yaml"
import log from "loglevel"
import { Action, CommonArguments } from "../../core/actions/model"
import { ProcessResult, Reporter, TransformedDefinition } from "../../core/model"
import { GetReleaseDefinitionProcessResult } from "../model/get-release-definition-process-result"
import { transformGetReleaseDefinitionProcessResultForReporting } from "./util"

class GetReleaseDefinitionYamlReporter implements Reporter {
  canReport(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetReleaseDefinitionProcessResult && args.output === "yaml"
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    log.info(safeDump(transformGetReleaseDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args)))
  }
}

export { GetReleaseDefinitionYamlReporter }

