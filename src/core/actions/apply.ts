import { process } from '../process'
import { inputDefinitions as inputDefinitionsFromYaml } from '../util/yaml'
import { Action, ApplyArguments } from './model'

export default async (args: ApplyArguments) => {
  const definitions = await inputDefinitionsFromYaml(args)
  return process(definitions, Action.APPLY, args)
}
