import { Action, CommonArguments } from '../../core/actions/model'
import { Definition, DefinitionGrouper } from '../../core/model'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'

class ApplyAzureDefinitionGrouper implements DefinitionGrouper {
  canGroup(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && action === Action.APPLY
  }
  group(definition: Definition, _action: Action, _args: CommonArguments): [string, string[]] {
    return [
      definition.kind,
      [Kind.BUILD_DEFINITION, Kind.RELEASE_DEFINITION]
    ]
  }
}

export { ApplyAzureDefinitionGrouper }

