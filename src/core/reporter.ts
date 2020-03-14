import { Action, CommonArguments } from "./actions/model"
import { ProcessResult, Reporter, TransformedDefinition } from "./model"

/* tslint:disable:no-console */ // TODO
class FallbackReporter implements Reporter {
  canReport(_processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, _args: CommonArguments): boolean {
    return true
  }
  async report(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, action: Action, _args: CommonArguments): Promise<void> {
    if (processResult.error) {
      console.log(`Error occurred for the action ${action}: ${processResult.error.message}`)
    } else if (processResult.info) {
      console.log(processResult.info)
    }
  }
}

export { FallbackReporter }

