import { Definition, ApplyArguments, GetArguments } from '.'

interface GetResult {
    name: string,
    description: string
}

interface Api {
    apply(definition: Definition, args: ApplyArguments): Promise<any> // TODO any => ApplyResult (status, error message, ...)
    delete(definition: Definition, args: ApplyArguments): Promise<any>
    get(args: GetArguments): Promise<GetResult[]>
}

interface KindProcessor {
    apply(definition: Definition, args: ApplyArguments): Promise<any>
    delete(definition: Definition, args: ApplyArguments): Promise<any>
    get(args: GetArguments): Promise<GetResult[]>
}

export {
    Api,
    KindProcessor,
    GetResult
}