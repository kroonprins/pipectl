import { promises as fs } from 'fs'
import readStdin from 'get-stdin'
import { safeLoadAll } from 'js-yaml'
import { CommonArguments as Arguments } from '../actions/model'
import { Definition } from '../model'

interface FileOptionHandler {
    (fileOption: string): Promise<string>
}

const inputDefinitions = async (args: Arguments) => {
    if(!(args.filename && args.filename.length)) {
        throw new Error('-f option not given')
    }
    let definitions: Definition[] = []
    for(const fileOption of args.filename) {
        let handler: FileOptionHandler = await getFileOptionHandler(fileOption)

        const inputDefinitions = await handler(fileOption)

        definitions.push(...safeLoadAll(inputDefinitions) as Definition[])
    }
    return definitions
}

const getFileOptionHandler = async (fileOption: string) => {
    if (fileOption === "-") {
        return stdin
    }
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

export {
    inputDefinitions
}