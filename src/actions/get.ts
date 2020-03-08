
import { GetArguments } from '../model/'
import { getApi } from '../api'

export default async (kind: string, name: string, args: GetArguments) => {
    args.kind = kind // TODO, the quirks of commander
    args.name = name
    console.log(`Arguments get: ${args.kind} - name[${args.name}] - namespace[${args.namespace}]`) // TODO toString?

    const results = await getApi().get(args)
    console.log('NAME\tDESCRIPTION') // TODO column properly
    for(const result of results) {
        console.log(`${result.name}\t${result.description}`)
    }
}

