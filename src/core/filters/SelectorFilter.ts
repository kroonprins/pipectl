import { Action, CommonArguments } from "../actions/model"
import { DefinitionFilter, TransformedDefinition } from "../model"

class SelectorFilter implements DefinitionFilter {
  canFilter(_transformedDefinition: TransformedDefinition, _transformedDefinitions: TransformedDefinition[], action: Action, _args: CommonArguments): boolean {
    return action === Action.APPLY || action === Action.DELETE
  }
  filter(transformedDefinition: TransformedDefinition, _transformedDefinitions: TransformedDefinition[], _action: Action, args: CommonArguments): boolean {
    if (!args.selector) {
      return false
    }
    const [labelName, labelValue] = args.selector.split("=") // TODO manage multiple, manage == and !=
    if (transformedDefinition.sourceDefinition.metadata.labels && transformedDefinition.sourceDefinition.metadata.labels[labelName] === labelValue) {
      return false
    }
    return true
  }
}

export { SelectorFilter }

