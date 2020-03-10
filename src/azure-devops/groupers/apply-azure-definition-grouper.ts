import { DefinitionGrouper, TransformedDefinition } from "../../core/model"
import { Action, CommonArguments } from "../../core/actions/model"
import { AzureDefinition, Kind } from "../model"

class ApplyAzureDefinitionGrouper implements DefinitionGrouper {
  canGroup(definition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
    return definition instanceof AzureDefinition && action === Action.APPLY
  }
  group(definition: TransformedDefinition, action: Action, args: CommonArguments): [string, string[]] {
    return [
      (definition as AzureDefinition<any>).kind,
      [Kind.BUILD_DEFINITION, Kind.RELEASE_DEFINITION]
    ]
  }
}

export {
  ApplyAzureDefinitionGrouper
}
