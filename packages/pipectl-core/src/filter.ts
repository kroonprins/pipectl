import { Action, CommonArguments } from './actions/model'
import { TransformedDefinition } from './model'
import { filters } from './registration'
import { log } from './util/logging'

const filter = (transformedDefinitions: TransformedDefinition[], action: Action, args: CommonArguments): TransformedDefinition[] => {
  return transformedDefinitions
    .flatMap(transformedDefinition => {
      const shouldFilter = filters()
        .every(f => f.canFilter(transformedDefinition, transformedDefinitions, action, args) ? f.filter(transformedDefinition, transformedDefinitions, action, args) : true)
      log.debug(`[filter] Should filter decision: ${shouldFilter} for ${transformedDefinition.shortName()}`)
      return shouldFilter ? [transformedDefinition] : []
    })
}

export { filter }

