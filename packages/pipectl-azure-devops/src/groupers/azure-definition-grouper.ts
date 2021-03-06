import { Action, CommonArguments } from '@kroonprins/pipectl/dist/actions/model'
import { Definition, DefinitionGrouper } from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { API_VERSION, isAzureDevOps } from '../util'

class AzureDefinitionGrouper implements DefinitionGrouper {
  canGroup(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return isAzureDevOps(definition.apiVersion) && action !== Action.APPLY
  }
  group(
    _definition: Definition,
    _action: Action,
    _args: CommonArguments
  ): [string, string[]] {
    log.debug(`[AzureDefinitionGrouper] ${API_VERSION}`)
    return [API_VERSION, [API_VERSION]]
  }
}

export { AzureDefinitionGrouper }
