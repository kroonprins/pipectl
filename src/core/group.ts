import { TransformedDefinition, TransformedDefinitionGroup, TransformedDefinitionGroupItem } from "./model"
import { Action, CommonArguments } from "./actions/model"
import { groupers } from "./registration"

const group = (definitions: TransformedDefinition[], action: Action, args: CommonArguments): TransformedDefinitionGroup[] => {
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
          transformedDefinitions: knownGroup === _group ? [definition] : []
        }
      }) as TransformedDefinitionGroupItem[]
    })
    .reduce<TransformedDefinitionGroup[]>((acc, val) => {
      val.forEach((item, index) => {
        if (index >= acc.length) {
          acc.push({ items: [item] })
        } else {
          if (!item.transformedDefinitions.length) {
            return
          }
          const groupAtIndex = acc[index]
          if (!groupAtIndex) {
            /* tslint:disable-next-line:no-console */
            console.log('wtf, this shouldn\'t happen...')
          } else {
            const indexExisting = groupAtIndex.items.findIndex(groupItem => item.name === groupItem.name)
            if (indexExisting !== -1) {
              groupAtIndex.items[indexExisting].transformedDefinitions.push(...item.transformedDefinitions)
            } else {
              groupAtIndex.items = [item]
            }
          }
        }
      })
      return acc
    }, [])
}

export {
  group
}
