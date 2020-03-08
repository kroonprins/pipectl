
import { getInputDefinitions } from '../util/yaml'
import { ApplyArguments } from '../model/'
import { getApi } from '../api'

export default async (args: ApplyArguments) => {
    console.log(`Arguments apply: ${args.filename} - recursive[${args.recursive}] - dryRun[${args.dryRun}] - namespace[${args.namespace}]`) // TODO toString?
    const definitions = await getInputDefinitions(args)

    await Promise.all(
        definitions.map(definition => {
            return getApi().apply(definition, args)
        })
    )
}

