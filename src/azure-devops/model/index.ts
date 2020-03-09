import { TransformedDefinition } from "../../core/model"

abstract class AzureDefinition<T> implements TransformedDefinition {
  constructor(
    public apiVersion: string, // TODO public?
    public kind: string,
    public project: string,
    public spec: T
  ) { }

  abstract uniqueId(): string
}

enum Kind {
  BUILD_DEFINITION = "BuildDefinition",
  RELEASE_DEFINITION = "ReleaseDefinition",
}

export {
  AzureDefinition,
  Kind
}
