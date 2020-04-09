import { currentServer } from '../config'
import { Definition } from '../model'
import { process } from '../process'
import { namespace } from '../util'
import { log } from '../util/logging'
import { Action, GetArguments } from './model'
import { stringifyGetArguments } from './util'

export default async (kind: string, name: string, args: GetArguments) => {
  args.kind = kind
  args.name = name
  log.debug(`Action get '${stringifyGetArguments(args)}'`)
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
