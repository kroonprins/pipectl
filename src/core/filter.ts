import { Action, CommonArguments } from "./actions/model"
import { TransformedDefinition } from "./model"
import { filters } from "./registration"

const filter = (transformedDefinitions: TransformedDefinition[], action: Action, args: CommonArguments): TransformedDefinition[] => {
  return transformedDefinitions
    .flatMap(transformedDefinition => {
      const shouldFilter = filters()
        .some(f => f.canFilter(transformedDefinition, transformedDefinitions, action, args) ? f.filter(transformedDefinition, transformedDefinitions, action, args) : false)
      return shouldFilter ? [] : [transformedDefinition]
    })
}

export { filter }

