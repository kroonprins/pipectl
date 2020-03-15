import log from 'loglevel'
import { Action, CommonArguments } from '../actions/model'
import { DefinitionFilter, TransformedDefinition } from '../model'

class SelectorFilter implements DefinitionFilter {
  canFilter(_transformedDefinition: TransformedDefinition, _transformedDefinitions: TransformedDefinition[], action: Action, _args: CommonArguments): boolean {
    return action === Action.APPLY || action === Action.DELETE
  }
  filter(transformedDefinition: TransformedDefinition, _transformedDefinitions: TransformedDefinition[], _action: Action, args: CommonArguments): boolean {
    if (!args.selector) {
      log.debug(`[SelectorFilter] Skipping SelectorFilter for '${transformedDefinition.shortName()}' because no selector specified.`)
      return true
    }

    const shouldFilter: boolean = args.selector.split(',')
      .map(selector => {
        log.debug(`[SelectorFilter] Processing selector ${selector} for '${transformedDefinition.shortName()}'`)
        if (selector.indexOf('=') === -1 || (selector.indexOf('=') !== selector.lastIndexOf('=') && selector.indexOf('=') !== selector.lastIndexOf('=') - 1)) {
          log.warn(`WARN invalid selector syntax ${selector}`)
          return true
        }
        if (selector.indexOf('!=') !== -1) {
          const [labelName, labelValue] = selector.split('!=')
          log.debug(`[SelectorFilter] Select !=, labelName[${labelName}], labelValue[${labelValue}]`)
          const shouldFilterNotEquals = !(transformedDefinition.sourceDefinition.metadata.labels && transformedDefinition.sourceDefinition.metadata.labels[labelName] === labelValue)
          log.debug(`[SelectorFilter] Should filter not equals: ${shouldFilterNotEquals} for '${transformedDefinition.shortName()}'`)
          return shouldFilterNotEquals
        } else {
          const [labelName, singleEqual, doubleEqual] = selector.split('=')
          const labelValue = doubleEqual ? doubleEqual : singleEqual
          log.debug(`[SelectorFilter] Select == or =, labelName[${labelName}], labelValue[${labelValue}]`)
          const shouldFilterEquals = transformedDefinition.sourceDefinition.metadata.labels && transformedDefinition.sourceDefinition.metadata.labels[labelName] === labelValue
          log.debug(`[SelectorFilter] Should filter equals: ${shouldFilterEquals} for '${transformedDefinition.shortName()}'`)
          return shouldFilterEquals
        }
      })
      .every(selectorMatch => selectorMatch)
    log.debug(`[SelectorFilter] Should filter end conclusion: ${shouldFilter} for '${transformedDefinition.shortName()}'`)
    return shouldFilter
  }
}

export { SelectorFilter }

