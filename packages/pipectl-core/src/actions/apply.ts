import { process } from '../process'
import { inputDefinitions as inputDefinitionsFromFiles } from '../files'
import { log } from '../util/logging'
import { Action, ApplyArguments } from './model'
import { stringifyApplyArguments } from './util'

export default async (args: ApplyArguments) => {
  log.debug(`Action apply '${stringifyApplyArguments(args)}'`)
  const definitions = await inputDefinitionsFromFiles(args)
  return process(definitions, Action.APPLY, args)
}
