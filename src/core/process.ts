import log from "loglevel"
import { Action, CommonArguments } from "./actions/model"
import { filter } from "./filter"
import { group } from "./group"
import { Definition, DefinitionGroup, TransformedDefinition } from "./model"
import { processors, reporters } from "./registration"
import { transform } from "./transform"
import { completeDefinitions } from './util'

const process = async (definitions: Definition[], action: Action, args: CommonArguments) => {
  // validate & complete
  const completedDefinitions = completeDefinitions(definitions, args)

  // group
  const groupedDefinitions = group(completedDefinitions, action, args)

  // process & report
  await processAction(groupedDefinitions, action, args)
}

const processAction = async (groups: DefinitionGroup[], action: Action, args: CommonArguments) => {
  for (const definitionGroup of groups) {
    await Promise.all(definitionGroup.items
      .flatMap(async groupItem => {
        log.debug(`Processing group ${groupItem.name}`)

        // transform
        const transformedDefinitions: TransformedDefinition[] = await transform(groupItem.definitions, action, args)

        // filter
        const filteredDefinitions = filter(transformedDefinitions, action, args)

        // process & report
        return Promise.all(filteredDefinitions
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

