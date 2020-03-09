import { CommonArguments } from "../actions/model"
import { defaultNamespace } from "../config"
import { TransformedDefinition, Definition } from "../model"

const applySelector = (definitions: Definition[], args: CommonArguments): Definition[] => {
  return definitions.
    filter(definition => {
      if (!args.selector) {
        return true
      }
      const [labelName, labelValue] = args.selector.split("=") // TODO manage multiple
      if (definition.metadata.labels && definition.metadata.labels[labelName] === labelValue) {
        return true
      }
      return false
    })
}

const completeDefinitions = (definitions: Definition[], args: CommonArguments): Definition[] => { // TODO better name for this
  return definitions
    .map(definition => {
      if (!definition.apiVersion) throw new Error(`Missing apiVersion for definition ${definition}`)
      if (!definition.kind) throw new Error(`Missing kind for definition ${definition}`)
      if (!definition.spec) throw new Error(`Missing spec for definition ${definition}`)
      if (!definition.metadata.namespace) {
        definition.metadata.namespace = namespace(args)
      }
      return definition
    })
}

const namespace = (args: CommonArguments): string => {
  if (args.namespace) {
    return args.namespace
  }
  const _defaultNamespace = defaultNamespace()
  if (_defaultNamespace) {
    return _defaultNamespace
  }
  throw new Error('Can not determine the namespace.') // TODO global fallback "default" ?
}

class Definitions {
  private definitions: Map<string, TransformedDefinition>

  constructor() {
    this.definitions = new Map<string, TransformedDefinition>()
  }

  add(...definitions: TransformedDefinition[]): Definitions {
    for (const definition of definitions) {
      const key: string = definition.uniqueId()
      if (this.definitions.has(key)) {
        /* tslint:disable-next-line:no-console */ // TODO
        console.log(`WARN duplicate definition for TODO (${key}). Only one will be processed`)
      } else {
        this.definitions.set(key, definition)
      }
    }
    return this
  }

  list(): TransformedDefinition[] {
    return [...this.definitions.values()]
  }
}

const filterOutDuplicates = (definitions: TransformedDefinition[]): TransformedDefinition[] => {
  return new Definitions().add(...definitions).list()
}

export {
  applySelector,
  completeDefinitions,
  filterOutDuplicates,
  namespace
}
