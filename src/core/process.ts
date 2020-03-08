import { transform } from "./transform"
import { Definition, TransformedDefinition } from "./model"
import { CommonArguments, Action } from "./actions/model"
import { applySelector, completeDefinitions, filterOutDuplicates } from './util'
import { processors } from "./registration"

const process = async (definitions: Definition[], action: Action, args: CommonArguments) => {
    // filter selector
    const selectedDefinitions = applySelector(definitions, args)

    // validate & complete
    const completedDefinitions = completeDefinitions(selectedDefinitions, args)

    // transform
    const transformedDefinitions: TransformedDefinition[] = await transform(completedDefinitions, action, args)
    console.log(`Transformed: ${transformedDefinitions}`)

    // duplicate removal
    const definitionsWithoutDuplicates = filterOutDuplicates(transformedDefinitions)
    console.log(`Duplicates filtered: ${definitionsWithoutDuplicates}`)

    // group

    // process
    const processResults = await processAction(definitionsWithoutDuplicates, action, args)
    processResults.forEach(r => console.log(r.message))

    // report
}

const processAction = (definitions: TransformedDefinition[], action: Action, args: CommonArguments) => {
    return Promise.all(
        definitions
        .map(async definition => {
            const processor = processors()
                .find(processor => processor.canProcess(definition, action, args))
            if (!processor) {
                throw new Error(`TODO no processor registered`)
            }
            const processResult = await processor.process(definition, action, args)
            return processResult
        })
    )
}

export {
    process
}