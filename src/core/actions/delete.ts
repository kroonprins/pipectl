import { ApplyArguments, Action } from "./model";
import { inputDefinitions as inputDefinitionsFromYaml } from "../util/yaml";
import { process } from '../process'

export default async (args: ApplyArguments) => {
    const definitions = await inputDefinitionsFromYaml(args)
    return process(definitions, Action.DELETE, args)
}

