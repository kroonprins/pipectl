import { Action, CommonArguments } from "./actions/model"
import { Definition, DefinitionSelector } from "./model"
import { selectors } from "./registration"

const select = (definitions: Definition[], action: Action, args: CommonArguments): Definition[] => {
  return definitions
    .flatMap(definition => {
      const selector = selectors()
        .find(s => s.canSelect(definition, action, args))
      if (!selector) {
        throw new Error(`TODO no selector registered`)
      }
      return selector.select(definition, action, args) ? [definition] : []
    })
}

class DefaultSelector implements DefinitionSelector {
  canSelect(_definition: Definition, action: Action, _args: CommonArguments): boolean {
    return action === Action.APPLY || action === Action.DELETE
  }
  select(definition: Definition, _action: Action, args: CommonArguments): boolean {
    if (!args.selector) {
      return true
    }
    const [labelName, labelValue] = args.selector.split("=") // TODO manage multiple, manage == and !=
    if (definition.metadata.labels && definition.metadata.labels[labelName] === labelValue) {
      return true
    }
    return false
  }
}

export { select, DefaultSelector }

