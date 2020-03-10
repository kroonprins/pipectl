import { DefinitionGrouper, TransformedDefinition } from "../../core/model"
import { Action, CommonArguments } from "../../core/actions/model"
import { AzureDefinition, Kind } from "../model"
import { API_VERSION } from "../util"

class AzureDefinitionGrouper implements DefinitionGrouper {
  canGroup(definition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
    return definition instanceof AzureDefinition  && action !== Action.APPLY
  }
  group(definition: TransformedDefinition, action: Action, args: CommonArguments): [string, string[]] {
    return [
      API_VERSION,
      [API_VERSION]
    ]
  }
}

export {
  AzureDefinitionGrouper
}
