import { log } from '../util/logging'
import { process } from '../process'
import { inputDefinitions as inputDefinitionsFromYaml } from '../util/yaml'
import { Action, ApplyArguments } from './model'
import { stringifyApplyArguments } from './util'

export default async (args: ApplyArguments) => {
  log.debug(`Action apply '${stringifyApplyArguments(args)}'`)
  const definitions = await inputDefinitionsFromYaml(args)
  return process(definitions, Action.DELETE, args)
}

