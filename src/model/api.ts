import { Definition, Arguments } from '.'

interface Api {
    apply(definition: Definition, args: Arguments): Promise<any> // TODO any?
    delete(definition: Definition, args: Arguments): Promise<any> // TODO any?
}

interface KindProcessor {
    apply(definition: Definition, args: Arguments): Promise<any> // TODO any?
    delete(definition: Definition, args: Arguments): Promise<any> // TODO any?
}

export {
    Api,
    KindProcessor
}