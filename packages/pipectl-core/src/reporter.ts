import { log } from './util/logging'
import { Action, CommonArguments } from './actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from './model'

class FallbackReporter implements Reporter {
  canReport(_processResult: ProcessResult, _transformedDefinition: TransformedDefinition, _action: Action, _args: CommonArguments): boolean {
    return true
  }
  async report(processResult: ProcessResult, _transformedDefinition: TransformedDefinition, action: Action, _args: CommonArguments): Promise<void> {
    log.debug(`[FallbackReporter] reporting process result`)
    if (processResult.error) {
      log.error(`Error occurred for the action ${action}: ${processResult.error.message}`)
    } else if (processResult.info) {
      log.info(processResult.info)
    }
  }
}

export { FallbackReporter }

