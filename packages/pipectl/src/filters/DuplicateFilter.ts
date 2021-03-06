import { Action, CommonArguments } from '../actions/model'
import { DefinitionPreFilter, TransformedDefinition } from '../model'
import { log } from '../util/logging'

class DuplicateFilter implements DefinitionPreFilter {
  canFilter(
    _transformedDefinition: TransformedDefinition,
    _transformedDefinitions: TransformedDefinition[],
    _action: Action,
    _args: CommonArguments
  ): boolean {
    return true
  }
  filter(
    transformedDefinition: TransformedDefinition,
    transformedDefinitions: TransformedDefinition[],
    _action: Action,
    _args: CommonArguments
  ): boolean {
    const uniqueId = transformedDefinition.uniqueId()
    const uniqueIds = transformedDefinitions.map((t) => t.uniqueId())
    const firstIndex = uniqueIds.findIndex((u) => u === uniqueId)
    if (
      firstIndex >= 0 &&
      transformedDefinitions[firstIndex] !== transformedDefinition
    ) {
      log.warn(
        `WARN duplicate definition for TODO (${uniqueId}). Only one will be processed`
      )
      return false
    }
    return true
  }
}

export { DuplicateFilter }
