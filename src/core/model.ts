import { Action, CommonArguments } from "./actions/model";

interface Resource {
    apiVersion: string
    kind: string
}

interface Definition extends Resource {
    metadata: MetaData
    spec: object
}

interface Labels {
    [key: string]: string
}

interface MetaData {
    namespace: string
    labels?: Labels // TODO add them also as tags in azure devops?
    // TODO annotations?
}

interface TransformedDefinition extends UniqueId {

}

interface UniqueId {
    uniqueId(): string
}

interface DefinitionTransformer {
    canTransform(definition: Definition, action: Action, args: CommonArguments): boolean
    transform(definition: Definition, action: Action, args: CommonArguments): Promise<TransformedDefinition>
}

interface ActionProcessor {
    canProcess(transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean
    process(transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<ProcessResult>
}

interface ProcessResult { // TODO
    message: string
}

export {
    Resource,
    Definition,
    TransformedDefinition,
    DefinitionTransformer,
    ProcessResult,
    ActionProcessor
}