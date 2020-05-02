import { Action, CommonArguments } from '../actions/model'
import {
  Definition,
  DefinitionPostFilter,
  TransformedDefinition,
} from '../model'
import { log } from '../util/logging'

class SelectorPostFilter implements DefinitionPostFilter {
  canFilter(
    _definition: Definition,
    _transformedDefinition: TransformedDefinition,
    action: Action,
    args: CommonArguments
  ): boolean {
    return action === Action.GET && !!args.selector
  }
  filter(
    definition: Definition,
    transformedDefinition: TransformedDefinition,
    _action: Action,
    args: CommonArguments
  ): boolean {
    const shouldFilter: boolean = args
      .selector!.split(',')
      .map((selector) => {
        log.debug(
          `[SelectorPostFilter] Processing selector ${selector} for '${transformedDefinition.shortName()}'`
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
            `[SelectorPostFilter] Select !=, labelName[${labelName}], labelValue[${labelValue}]`
          )
          const shouldFilterNotEquals = !(
            definition.metadata.labels &&
            definition.metadata.labels[labelName] === labelValue
          )
          log.debug(
            `[SelectorPostFilter] Should filter not equals: ${shouldFilterNotEquals} for '${transformedDefinition.shortName()}'`
          )
          return shouldFilterNotEquals
        } else {
          const [labelName, singleEqual, doubleEqual] = selector.split('=')
          const labelValue = doubleEqual ? doubleEqual : singleEqual
          log.debug(
            `[SelectorPostFilter] Select == or =, labelName[${labelName}], labelValue[${labelValue}]`
          )
          const shouldFilterEquals =
            definition.metadata.labels &&
            definition.metadata.labels[labelName] === labelValue
          log.debug(
            `[SelectorPostFilter] Should filter equals: ${shouldFilterEquals} for '${transformedDefinition.shortName()}'`
          )
          return shouldFilterEquals
        }
      })
      .every((selectorMatch) => selectorMatch)
    log.debug(
      `[SelectorPostFilter] Should filter end conclusion: ${shouldFilter} for '${transformedDefinition.shortName()}'`
    )
    return shouldFilter
  }
}

export { SelectorPostFilter }
