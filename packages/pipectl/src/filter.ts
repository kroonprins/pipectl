import { Action, CommonArguments } from './actions/model'
import { ProcessResult, TransformedDefinition } from './model'
import { postFilters, preFilters } from './registration'
import { log } from './util/logging'

const preFilter = (
  transformedDefinitions: TransformedDefinition[],
  action: Action,
  args: CommonArguments
): TransformedDefinition[] => {
  return transformedDefinitions.flatMap((transformedDefinition) => {
    const shouldFilter = preFilters().every((f) =>
      f.canFilter(transformedDefinition, transformedDefinitions, action, args)
        ? f.filter(transformedDefinition, transformedDefinitions, action, args)
        : true
    )
    log.debug(
      `[preFilter] Should filter decision: ${shouldFilter} for ${transformedDefinition.shortName()}`
    )
    return shouldFilter ? [transformedDefinition] : []
  })
}

const postFilter = (
  processResult: ProcessResult,
  transformedDefinition: TransformedDefinition,
  action: Action,
  args: CommonArguments
): ProcessResult => {
  return {
    ...processResult,
    results: (processResult.results || []).flatMap((definition) => {
      const shouldFilter = postFilters().every((f) =>
        f.canFilter(definition, transformedDefinition, action, args)
          ? f.filter(definition, transformedDefinition, action, args)
          : true
      )
      log.debug(
        `[postFilter] Should filter decision: ${shouldFilter} for ${transformedDefinition.shortName()}`
      )
      return shouldFilter ? [definition] : []
    }),
  }
}

export { preFilter, postFilter }
