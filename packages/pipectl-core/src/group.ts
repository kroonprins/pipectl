import { Action, CommonArguments } from './actions/model'
import { Definition, DefinitionGroup, DefinitionGroupItem } from './model'
import { groupers } from './registration'
import { log } from './util/logging'

const group = (definitions: Definition[], action: Action, args: CommonArguments): DefinitionGroup[] => {
  return definitions
    .map(definition => {
      const grouper = groupers()
        .find(g => g.canGroup(definition, action, args))
      if (!grouper) {
        throw new Error(`TODO no grouper registered`)
      }

      const [_group, knownGroups] = grouper.group(definition, action, args)
      log.debug(`[group] group[${_group}], knownGroup[${knownGroups}] for ${JSON.stringify(definition)}`)
      return knownGroups.map(knownGroup => {
        return {
          name: knownGroup,
          definitions: knownGroup === _group ? [definition] : []
        }
      }) as DefinitionGroupItem[]
    })
    .reduce<DefinitionGroup[]>((acc, val) => {
      log.debug(`[group] reducing acc[${JSON.stringify(acc)}], val[${JSON.stringify(val)}]`)
      val.forEach((item, index) => {
        log.debug(`[group] definition group item item[${JSON.stringify(item)}], val[${index}]`)
        if (index >= acc.length) {
          log.debug('[group] initial call, first fill of the accumulator')
          acc.push({ items: [item] })
        } else {
          log.debug('[group] add items definitions to the accumulator')
          if (!item.definitions.length) {
            log.debug('[group] skipping because definitions empty')
            return
          }
          const groupAtIndex = acc[index]
          if (!groupAtIndex) {
            log.error('wtf, this shouldn\'t happen...')
          } else {
            const indexExisting = groupAtIndex.items.findIndex(groupItem => item.name === groupItem.name)
            if (indexExisting !== -1) {
              log.debug('[group] group item exists in accumulator, adding definitions to its items list')
              groupAtIndex.items[indexExisting].definitions.push(...item.definitions)
            } else {
              log.debug('[group] group item does not yet exist in accumulator, initializing its items list with definitions')
              groupAtIndex.items = [item]
            }
          }
        }
      })
      log.debug(`[group] accumulator value[${JSON.stringify(acc)}]`)
      return acc
    }, [])
}

export { group }

