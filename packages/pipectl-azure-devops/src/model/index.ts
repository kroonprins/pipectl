import { Definition, TransformedDefinition } from '@kroonprins/pipectl-core/dist/model'

abstract class AzureDefinition<T> implements TransformedDefinition {
  constructor(
    public sourceDefinition: Definition,
    public apiVersion: string, // TODO public?
    public kind: Kind,
    public project: string,
    public spec: T
  ) { }

  abstract uniqueId(): string
  abstract shortName(): string
}

enum Kind {
  BUILD_DEFINITION = 'BuildDefinition',
  RELEASE_DEFINITION = 'ReleaseDefinition',
  VARIABLE_GROUP = 'VariableGroup',
}

export { AzureDefinition, Kind }

