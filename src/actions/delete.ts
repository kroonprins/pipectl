
import { getInputDefinitions } from '../util/yaml'
import { Arguments } from '../model'
import { getApi } from '../api'

export default async (args: Arguments) => {
    console.log(`Arguments delete: ${args.filename} - recursive[${args.recursive}] - dryRun[${args.dryRun}]`)
    const definitions = await getInputDefinitions(args)

    await Promise.all(
        definitions.map(definition => {
            return getApi(definition).delete(definition, args)
        })
    )
}

