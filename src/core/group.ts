import log from 'loglevel'
import { Action, CommonArguments } from './actions/model'
import { Definition, DefinitionGroup, DefinitionGroupItem } from './model'
import { groupers } from './registration'

const group = (definitions: Definition[], action: Action, args: CommonArguments): DefinitionGroup[] => {
  return definitions
    .map(definition => {
      const grouper = groupers()
        .find(g => g.canGroup(definition, action, args))
      if (!grouper) {
        throw new Error(`TODO no grouper registered`)
      }

      const [_group, knownGroups] = grouper.group(definition, action, args)
      return knownGroups.map(knownGroup => {
        return {
          name: knownGroup,
          definitions: knownGroup === _group ? [definition] : []
        }
      }) as DefinitionGroupItem[]
    })
    .reduce<DefinitionGroup[]>((acc, val) => {
      val.forEach((item, index) => {
        if (index >= acc.length) {
          acc.push({ items: [item] })
        } else {
          if (!item.definitions.length) {
            return
          }
          const groupAtIndex = acc[index]
          if (!groupAtIndex) {
            log.error('wtf, this shouldn\'t happen...')
          } else {
            const indexExisting = groupAtIndex.items.findIndex(groupItem => item.name === groupItem.name)
            if (indexExisting !== -1) {
              groupAtIndex.items[indexExisting].definitions.push(...item.definitions)
            } else {
              groupAtIndex.items = [item]
            }
          }
        }
      })
      return acc
    }, [])
}

export { group }

