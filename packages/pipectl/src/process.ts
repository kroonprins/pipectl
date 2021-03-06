import { Action, CommonArguments } from './actions/model'
import { postFilter, preFilter } from './filter'
import { group } from './group'
import { Definition, DefinitionGroup, TransformedDefinition } from './model'
import { processors, reporters } from './registration'
import { transform } from './transform'
import { completeDefinitions } from './util'
import { log } from './util/logging'

const process = async (
  definitions: Definition[],
  action: Action,
  args: CommonArguments
) => {
  log.debug('[Process] complete and validate definitions')
  const completedDefinitions = completeDefinitions(definitions, args)

  log.debug('[Process] group definitions')
  const groupedDefinitions = group(completedDefinitions, action, args)

  log.debug('[Process] start processing')
  await processAction(groupedDefinitions, action, args)
}

const processAction = async (
  groups: DefinitionGroup[],
  action: Action,
  args: CommonArguments
) => {
  for (const definitionGroup of groups) {
    log.debug(
      `[Process] process all definition group, items[${definitionGroup.items
        .map((d) => d.name)
        .join(',')}]`
    )
    await Promise.all(
      definitionGroup.items.flatMap(async (groupItem) => {
        log.debug(`[Process] Processing group ${groupItem.name}`)

        log.debug('[Process] transform definitions')
        const transformedDefinitions: TransformedDefinition[] = await transform(
          groupItem.definitions,
          action,
          args
        )

        log.debug('[Process] filter definitions')
        const filteredDefinitions = preFilter(
          transformedDefinitions,
          action,
          args
        )

        log.debug('[Process] process and report')
        return Promise.all(
          filteredDefinitions.flatMap(async (definition) => {
            log.debug(`[Process] process definition ${definition.shortName()}`)
            const processor = processors().find((p) =>
              p.canProcess(definition, action, args)
            )
            if (!processor) {
              throw new Error('TODO no processor registered')
            }
            const processResult = await processor.process(
              definition,
              action,
              args
            )

            log.debug(
              `[Process] process result for ${definition.shortName()}, result '${JSON.stringify(
                processResult
              )}'`
            )

            const filteredProcessResult = postFilter(
              processResult,
              definition,
              action,
              args
            )

            log.debug(
              `[Process] filtered process result for ${definition.shortName()}, result '${JSON.stringify(
                filteredProcessResult
              )}'`
            )

            const reporter = reporters().find((r) =>
              r.canReport(filteredProcessResult, definition, action, args)
            )
            if (!reporter) {
              throw new Error('TODO no reporter registered')
            }
            return reporter.report(
              filteredProcessResult,
              definition,
              action,
              args
            )
          })
        )
      })
    )
  }
}

export { process }
