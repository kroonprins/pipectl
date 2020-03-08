import { DefinitionTransformer, ActionProcessor, Reporter } from "./model";

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

const _reporters: Reporter[] = []

const registerReporter = (...reporters: Reporter[]): void => {
    _reporters.push(...reporters)
}

const NoopReporter = new class implements Reporter {
    canReport() {
        return true
    }
    report() {
        return Promise.resolve()
    }
}

const reporters = (): readonly Reporter[] => {
    if(_reporters[_reporters.length - 1 ] !== NoopReporter) {
        _reporters.push(NoopReporter)
    }
    return Object.freeze(_reporters)
}

export {
    registerTransformer,
    transformers,
    registerActionProcessor,
    processors,
    registerReporter,
    reporters
}