import { Definition, TransformedDefinition } from 'pipectl-core/src/model'

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
}

export { AzureDefinition, Kind }

