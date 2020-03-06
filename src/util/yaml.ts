import { promises as fs } from 'fs'
import readStdin from 'get-stdin'
import * as yaml from 'js-yaml'
import { Definition, Arguments } from '../model'

interface FileOptionHandler {
    (fileOption: string): Promise<string>
}

class Definitions {
    private definitions: Map<String, Definition>

    constructor() {
        this.definitions = new Map<String, Definition>()
    }

    add(selector: string, ...definitions: Definition[]) {
        for(const definition of definitions) {
            if(!select(selector, definition)) {
                console.log('Skipping definition TODO')
                continue
            }
            const key: string = this.key(definition)
            if(this.definitions.has(this.key(definition))) {
                console.log(`WARN duplicate definition for TODO. Only one will be processed`)
            } else {
                this.definitions.set(key, definition)
            }
        }
    }

    list(): Definition[] {
        return [...this.definitions.values()]
    }

    private key(definition: Definition): string {
        // TODO path should be "normalized" somewhere
        // TODO have equals method in Definition instead?
        return `${definition.apiVersion}${definition.kind}${definition.metadata.name}${definition.spec.path}`
    }
}

const getInputDefinitions = async (args: Arguments) => {
    let definitions: Definitions = new Definitions()
    for(const fileOption of args.filename) {
        let handler: FileOptionHandler
        if (fileOption === "-") {
            handler = stdin
        } else {
            handler = await getFileOptionHandler(fileOption)
        }

        const inputDefinitions = await handler(fileOption)

        definitions.add(args.selector, ...yaml.safeLoadAll(inputDefinitions) as Definition[])
    }
    return definitions.list()
}

const getFileOptionHandler = async (fileOption: string) => {
    try {
        const lstat = await fs.lstat(fileOption)
        if (lstat.isFile()) {
            return file
        } else if (lstat.isDirectory()) {
            return directory
        } else {
            console.log(`Error accessing ${fileOption}`)
            throw Error(`Given ${fileOption} is not a file or a directory.`)
        }
    } catch (e) {
        console.log(`Error accessing ${fileOption}`)
        throw e
    }
}

const stdin: FileOptionHandler = () => {
    return readStdin()
}

const file: FileOptionHandler = async (fileOption: string) => {
    const buffer = await fs.readFile(fileOption)
    return buffer.toString()
}

const directory: FileOptionHandler = async () => {
    throw Error("Not supported yet")
}

const select = (selector: string, definition: Definition) => {
    if(!selector) {
        return true
    }
    const [labelName, labelValue] = selector.split("=") // TODO manage multiple
    if(definition.metadata.labels[labelName] === labelValue) {
        return true
    }
    return false
}

export {
    getInputDefinitions
}