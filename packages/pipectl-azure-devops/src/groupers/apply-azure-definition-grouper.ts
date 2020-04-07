import { Action, CommonArguments } from 'pipectl-core/src/actions/model'
import { Definition, DefinitionGrouper } from 'pipectl-core/src/model'
import { log } from 'pipectl-core/src/util/logging'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'

class ApplyAzureDefinitionGrouper implements DefinitionGrouper {
  canGroup(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && action === Action.APPLY
  }
  group(definition: Definition, _action: Action, _args: CommonArguments): [string, string[]] {
    log.debug(`[ApplyAzureDefinitionGrouper] ${definition.kind}`)
    return [
      definition.kind,
      [Kind.BUILD_DEFINITION, Kind.RELEASE_DEFINITION]
    ]
  }
}

export { ApplyAzureDefinitionGrouper }

