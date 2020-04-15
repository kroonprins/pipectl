import { process } from '../process'
import { log } from '../util/logging'
import { inputDefinitions as inputDefinitionsFromFile } from '../files'
import { Action, ApplyArguments } from './model'
import { stringifyApplyArguments } from './util'

export default async (args: ApplyArguments) => {
  log.debug(`Action apply '${stringifyApplyArguments(args)}'`)
  const definitions = await inputDefinitionsFromFile(args)
  return process(definitions, Action.DELETE, args)
}
