import log from 'loglevel'
import { Action, CommonArguments } from '../actions/model'
import { DefinitionFilter, TransformedDefinition } from '../model'

class SelectorFilter implements DefinitionFilter {
  canFilter(_transformedDefinition: TransformedDefinition, _transformedDefinitions: TransformedDefinition[], action: Action, _args: CommonArguments): boolean {
    return action === Action.APPLY || action === Action.DELETE
  }
  filter(transformedDefinition: TransformedDefinition, _transformedDefinitions: TransformedDefinition[], _action: Action, args: CommonArguments): boolean {
    if (!args.selector) {
      return true
    }

    return args.selector.split(',')
      .map(selector => {
        if (selector.indexOf('=') === -1 || (selector.indexOf('=') !== selector.lastIndexOf('=') && selector.indexOf('=') !== selector.lastIndexOf('=') - 1)) {
          log.warn(`WARN invalid selector syntax ${selector}`)
          return true
        }
        if (selector.indexOf('!=') !== -1) {
          const [labelName, labelValue] = selector.split('!=')
          return !(transformedDefinition.sourceDefinition.metadata.labels && transformedDefinition.sourceDefinition.metadata.labels[labelName] === labelValue)
        } else {
          const [labelName, singleEqual, doubleEqual] = selector.split('=')
          const labelValue = doubleEqual ? doubleEqual : singleEqual
          return transformedDefinition.sourceDefinition.metadata.labels && transformedDefinition.sourceDefinition.metadata.labels[labelName] === labelValue
        }
      })
      .every(selectorMatch => selectorMatch)
  }
}

export { SelectorFilter }

