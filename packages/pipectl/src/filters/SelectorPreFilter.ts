import { Action, CommonArguments } from '../actions/model'
import { DefinitionPreFilter, TransformedDefinition } from '../model'
import { log } from '../util/logging'

class SelectorPreFilter implements DefinitionPreFilter {
  canFilter(
    _transformedDefinition: TransformedDefinition,
    _transformedDefinitions: TransformedDefinition[],
    action: Action,
    args: CommonArguments
  ): boolean {
    return (
      !!args.selector && (action === Action.APPLY || action === Action.DELETE)
    )
  }
  filter(
    transformedDefinition: TransformedDefinition,
    _transformedDefinitions: TransformedDefinition[],
    _action: Action,
    args: CommonArguments
  ): boolean {
    const shouldFilter: boolean = args
      .selector!.split(',')
      .map((selector) => {
        log.debug(
          `[SelectorPreFilter] Processing selector ${selector} for '${transformedDefinition.shortName()}'`
        )
        if (
          selector.indexOf('=') === -1 ||
          (selector.indexOf('=') !== selector.lastIndexOf('=') &&
            selector.indexOf('=') !== selector.lastIndexOf('=') - 1)
        ) {
          log.warn(`WARN invalid selector syntax ${selector}`)
          return true
        }
        if (selector.indexOf('!=') !== -1) {
          const [labelName, labelValue] = selector.split('!=')
          log.debug(
            `[SelectorPreFilter] Select !=, labelName[${labelName}], labelValue[${labelValue}]`
          )
          const shouldFilterNotEquals = !(
            transformedDefinition.sourceDefinition.metadata.labels &&
            transformedDefinition.sourceDefinition.metadata.labels[
              labelName
            ] === labelValue
          )
          log.debug(
            `[SelectorPreFilter] Should filter not equals: ${shouldFilterNotEquals} for '${transformedDefinition.shortName()}'`
          )
          return shouldFilterNotEquals
        } else {
          const [labelName, singleEqual, doubleEqual] = selector.split('=')
          const labelValue = doubleEqual ? doubleEqual : singleEqual
          log.debug(
            `[SelectorPreFilter] Select == or =, labelName[${labelName}], labelValue[${labelValue}]`
          )
          const shouldFilterEquals =
            transformedDefinition.sourceDefinition.metadata.labels &&
            transformedDefinition.sourceDefinition.metadata.labels[
              labelName
            ] === labelValue
          log.debug(
            `[SelectorPreFilter] Should filter equals: ${shouldFilterEquals} for '${transformedDefinition.shortName()}'`
          )
          return shouldFilterEquals
        }
      })
      .every((selectorMatch) => selectorMatch)
    log.debug(
      `[SelectorPreFilter] Should filter end conclusion: ${shouldFilter} for '${transformedDefinition.shortName()}'`
    )
    return shouldFilter
  }
}

export { SelectorPreFilter }
