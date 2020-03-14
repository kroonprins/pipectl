import { CommonArguments } from "../actions/model"
import { defaultNamespace } from "../config"
import { Definition } from "../model"

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

export { completeDefinitions, namespace }

