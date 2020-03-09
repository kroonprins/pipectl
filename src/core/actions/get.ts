import { GetArguments, Action } from "./model";
import { process } from '../process'
import { Definition } from "../model";
import { currentServer } from "../config";
import { namespace } from '../util'

export default async (kind: string, name: string, args: GetArguments) => {
    args.name = name
    const definitions: Definition[] = [{
        apiVersion: currentServer().type,
        kind: kind,
        metadata: {
            namespace: namespace(args)
        },
        spec: {}
    }]
    return process(definitions, Action.GET, args)
}
