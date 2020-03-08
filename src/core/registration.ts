import { DefinitionTransformer, ActionProcessor } from "./model";

const _transformers: DefinitionTransformer[] = []

const registerTransformer = (...definitionTransformers: DefinitionTransformer[]): void => {
    _transformers.push(...definitionTransformers)
}

const transformers = (): readonly DefinitionTransformer[] => {
    return Object.freeze(_transformers)
}

const _actionProcessors: ActionProcessor[] = []

const registerActionProcessor = (...actionProcessors: ActionProcessor[]): void => {
    _actionProcessors.push(...actionProcessors)
}

const processors = (): readonly ActionProcessor[] => {
    return Object.freeze(_actionProcessors)
}

export {
    registerTransformer,
    transformers,
    registerActionProcessor,
    processors
}