import { Action, CommonArguments } from './actions/model'
import { Definition } from './model'
import { transformers } from './registration'

const transform = (
  definitions: Definition[],
  action: Action,
  args: CommonArguments
) => {
  return Promise.all(
    definitions.map((definition) => {
      const transformer = transformers().find((t) =>
        t.canTransform(definition, action, args)
      )
      if (!transformer) {
        throw new Error(`TODO no transformer registered`)
      }
      return transformer.transform(definition, action, args)
    })
  )
}

export { transform }
