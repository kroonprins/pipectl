import { currentServer } from '../config'
import { Definition } from '../model'
import { process } from '../process'
import { namespace } from '../util'
import { log } from '../util/logging'
import { Action, GetArguments } from './model'
import { stringifyGetArguments } from './util'

export default async (args: GetArguments) => {
  log.debug(`Action get '${stringifyGetArguments(args)}'`)
  const definitions: Definition[] = [{
    apiVersion: currentServer().type,
    kind: args.kind,
    metadata: {
      namespace: namespace(args)
    },
    spec: {}
  }]
  return process(definitions, Action.GET, args)
}
