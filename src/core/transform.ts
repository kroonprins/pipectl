import { Definition, TransformedDefinition } from "./model";
import { transformers } from "./registration";

const transform = (definitions: Definition[]): TransformedDefinition[] => {
    return definitions
        .map(definition => {
            const transformer = transformers()
                .find(transformer => transformer.canTransform(definition))
            if (!transformer) {
                throw new Error(`TODO no transformer registered`)
            }
            return transformer.transform(definition)
        })
}

export {
    transform
}