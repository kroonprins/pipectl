import { Action, CommonArguments } from "./actions/model"
import { group } from "./group"
import { Definition, DefinitionGroup, TransformedDefinition } from "./model"
import { processors, reporters } from "./registration"
import { transform } from "./transform"
import { applySelector, completeDefinitions, filterOutDuplicates } from './util'

const process = async (definitions: Definition[], action: Action, args: CommonArguments) => {
  // filter selector
  const selectedDefinitions = applySelector(definitions, args)

  // validate & complete
  const completedDefinitions = completeDefinitions(selectedDefinitions, args)

  // group
  const groupedDefinitions = group(completedDefinitions, action, args)

  // process & report
  await processAction(groupedDefinitions, action, args)
}

const processAction = async (groups: DefinitionGroup[], action: Action, args: CommonArguments) => {
  for (const definitionGroup of groups) {
    await Promise.all(definitionGroup.items
      .flatMap(async groupItem => {
        /* tslint:disable-next-line:no-console */ // TODO
        console.log(`Processing group ${groupItem.name}`)

        // transform
        const transformedDefinitions: TransformedDefinition[] = await transform(groupItem.definitions, action, args)

        // duplicate removal
        const definitionsWithoutDuplicates = filterOutDuplicates(transformedDefinitions)

        // process & report
        return Promise.all(definitionsWithoutDuplicates
          .flatMap(async definition => {
            const processor = processors()
              .find(p => p.canProcess(definition, action, args))
            if (!processor) {
              throw new Error('TODO no processor registered')
            }
            const processResult = await processor.process(definition, action, args)
            const reporter = reporters()
              .find(r => r.canReport(processResult, definition, action, args))
            if (!reporter) {
              throw new Error('TODO no reporter registered')
            }
            return reporter.report(processResult, definition, action, args)
          }))
      }))
  }
}

export { process }

