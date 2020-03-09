import { DefinitionTransformer, ActionProcessor, Reporter, ProcessResult, TransformedDefinition } from "./model";
import { Action, CommonArguments } from "./actions/model";

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

const FallbackReporter = new class implements Reporter {
    canReport() {
        return true
    }
    async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments) {
        if(processResult.error) {
            console.log(`Error occurred for the action ${action}: ${processResult.error.message}`)
        } else if(processResult.info) {
            console.log(processResult.info)
        }
    }
}

const reporters = (): readonly Reporter[] => {
    if(_reporters[_reporters.length - 1 ] !== FallbackReporter) {
        _reporters.push(FallbackReporter)
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