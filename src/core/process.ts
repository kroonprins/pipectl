import { transform } from "./transform"
import { Definition, TransformedDefinition, TransformedDefinitionGroup } from "./model"
import { CommonArguments, Action } from "./actions/model"
import { applySelector, completeDefinitions, filterOutDuplicates } from './util'
import { processors, reporters } from "./registration"
import { group } from "./group"

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
  const groupedDefinitions = group(definitionsWithoutDuplicates, action, args)

  // process & report
  await processAction(groupedDefinitions, action, args)
}

const processAction = async (groups: TransformedDefinitionGroup[], action: Action, args: CommonArguments) => {
  for (const definitionGroup of groups) {
    await Promise.all(definitionGroup.items
      .flatMap(groupItem => {
        /* tslint:disable-next-line:no-console */ // TODO
        console.log(`Processing group ${groupItem.name}`)
        return groupItem.transformedDefinitions
          .flatMap(async definition => {
            const processor = processors()
              .find(p => p.canProcess(definition, action, args))
            if (!processor) {
              throw new Error('TODO no processor registered')
            }
            const processResult = await processor.process(definition, action, args)
            const reporter = reporters().find(r => r.canReport(processResult, definition, action, args))
            if (!reporter) {
              throw new Error('TODO no reporter registered')
            }
            return reporter.report(processResult, definition, action, args)
          })
      }))
  }
}

export {
  process
}
