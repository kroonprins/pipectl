import { Reporter, ProcessResult, TransformedDefinition } from "../../core/model"
import { Action, CommonArguments } from "../../core/actions/model"
import { GetReleaseDefinitionProcessResult } from "../model/get-release-definition-process-result"
import { transformGetReleaseDefinitionProcessResultForReporting } from "./util"

/* tslint:disable:no-console */ // TODO
class GetReleaseDefinitionJsonReporter implements Reporter {
  canReport(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
    return processResult instanceof GetReleaseDefinitionProcessResult && args.output === "json"
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    console.log(JSON.stringify(transformGetReleaseDefinitionProcessResultForReporting(processResult, transformedDefinition, action, args), undefined, 4))
  }
}

export {
  GetReleaseDefinitionJsonReporter,
}
