import { currentServer } from "../config"
import { Definition } from "../model"
import { process } from '../process'
import { namespace } from '../util'
import { Action, GetArguments } from "./model"

export default async (kind: string, name: string, args: GetArguments) => {
  args.name = name
  const definitions: Definition[] = [{
    apiVersion: currentServer().type,
    kind,
    metadata: {
      namespace: namespace(args)
    },
    spec: {}
  }]
  return process(definitions, Action.GET, args)
}
