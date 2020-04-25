import { Action, CommonArguments } from '@kroonprins/pipectl/dist/actions/model'
import { Definition, DefinitionGrouper } from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'

class ApplyAzureDefinitionGrouper implements DefinitionGrouper {
  private static mapping: Map<string, string> = new Map([
    [Kind.GIT_REPOSITORY, 'AzureDevOps_0'],
    [Kind.VARIABLE_GROUP, 'AzureDevOps_0'],
    [Kind.GIT_PULL_REQUEST, 'AzureDevOps_1'],
    [Kind.BUILD_DEFINITION, 'AzureDevOps_1'],
    [Kind.RELEASE_DEFINITION, 'AzureDevOps_2'],
  ])
  private static groups = [
    ...new Set(ApplyAzureDefinitionGrouper.mapping.values()),
  ].sort()

  canGroup(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      action === Action.APPLY &&
      !!ApplyAzureDefinitionGrouper.mapping.get(definition.kind)
    )
  }
  group(
    definition: Definition,
    _action: Action,
    _args: CommonArguments
  ): [string, string[]] {
    log.debug(`[ApplyAzureDefinitionGrouper] ${definition.kind}`)
    return [
      ApplyAzureDefinitionGrouper.mapping.get(definition.kind)!,
      ApplyAzureDefinitionGrouper.groups,
    ]
  }
}

export { ApplyAzureDefinitionGrouper }
