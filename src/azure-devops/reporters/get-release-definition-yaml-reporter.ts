import { Reporter, ProcessResult, TransformedDefinition } from "../../core/model"
import { Action, CommonArguments } from "../../core/actions/model"

class GetReleaseDefinitionYamlReporter implements Reporter {
  canReport(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
    return false
  }
  async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
    throw new Error("Method not implemented.")
  }
}

export {
  GetReleaseDefinitionYamlReporter,
}
