import { Action, CommonArguments } from '../../core/actions/model'
import { Definition, DefinitionGrouper } from '../../core/model'
import { API_VERSION, isAzureDevOps } from '../util'

class AzureDefinitionGrouper implements DefinitionGrouper {
  canGroup(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && action !== Action.APPLY
  }
  group(_definition: Definition, _action: Action, _args: CommonArguments): [string, string[]] {
    return [
      API_VERSION,
      [API_VERSION]
    ]
  }
}

export { AzureDefinitionGrouper }

