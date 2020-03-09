import { transform } from "./transform"
import { Definition, TransformedDefinition } from "./model"
import { CommonArguments, Action } from "./actions/model"
import { applySelector, completeDefinitions, filterOutDuplicates } from './util'
import { processors, reporters } from "./registration"

const process = async (definitions: Definition[], action: Action, args: CommonArguments) => {
    // filter selector
    const selectedDefinitions = applySelector(definitions, args)

    // validate & complete
    const completedDefinitions = completeDefinitions(selectedDefinitions, args)

    // transform
    const transformedDefinitions: TransformedDefinition[] = await transform(completedDefinitions, action, args)

    // duplicate removal
    const definitionsWithoutDuplicates = filterOutDuplicates(transformedDefinitions)

    // group
    // TODO

    // process & report
    await processAction(definitionsWithoutDuplicates, action, args)
}

const processAction = (definitions: TransformedDefinition[], action: Action, args: CommonArguments) => {
    return Promise.all(
        definitions
            .map(async definition => {
                const processor = processors()
                    .find(processor => processor.canProcess(definition, action, args))
                if (!processor) {
                    throw new Error('TODO no processor registered')
                }
                const processResult = await processor.process(definition, action, args)
                const reporter = reporters().find(reporter => reporter.canReport(processResult, definition, action, args))
                if(!reporter) {
                    throw new Error('TODO no reporter registered')
                }
                return reporter.report(processResult, definition, action, args)
            })
    )
}

export {
    process
}