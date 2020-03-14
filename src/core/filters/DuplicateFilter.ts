import { Action, CommonArguments } from "../actions/model"
import { DefinitionFilter, TransformedDefinition } from "../model"

class DuplicateFilter implements DefinitionFilter {
  canFilter(_transformedDefinition: TransformedDefinition, _transformedDefinitions: TransformedDefinition[], _action: Action, _args: CommonArguments): boolean {
    return true
  }
  filter(transformedDefinition: TransformedDefinition, transformedDefinitions: TransformedDefinition[], _action: Action, _args: CommonArguments): boolean {
    const uniqueId = transformedDefinition.uniqueId()
    const uniqueIds = transformedDefinitions.map(t => t.uniqueId())
    const firstIndex = uniqueIds.findIndex(u => u === uniqueId)
    if (firstIndex >= 0 && transformedDefinitions[firstIndex] !== transformedDefinition) {
      /* tslint:disable-next-line:no-console */ // TODO
      console.log(`WARN duplicate definition for TODO (${uniqueId}). Only one will be processed`)
      return true
    }
    return false
  }
}

export { DuplicateFilter }

