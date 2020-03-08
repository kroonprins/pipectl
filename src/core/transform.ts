import { Definition, TransformedDefinition } from "./model";
import { transformers } from "./registration";
import { Action, CommonArguments } from "./actions/model";

const transform = (definitions: Definition[], action: Action, args: CommonArguments) => {
    return Promise.all(
        definitions
        .map(definition => {
            const transformer = transformers()
                .find(transformer => transformer.canTransform(definition, action, args))
            if (!transformer) {
                throw new Error(`TODO no transformer registered`)
            }
            return transformer.transform(definition, action, args)
        })
    )
}

export {
    transform
}