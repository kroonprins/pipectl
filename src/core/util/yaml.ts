import { promises as fs } from 'fs'
import readStdin from 'get-stdin'
import { safeLoadAll } from 'js-yaml'
import { CommonArguments as Arguments } from '../actions/model'
import { Definition } from '../model'

type FileOptionHandler = (fileOption: string) => Promise<string>

const inputDefinitions = async (args: Arguments) => {
  if (!(args.filename && args.filename.length)) {
    throw new Error('-f option not given')
  }
  const definitions: Definition[] = []
  for (const fileOption of args.filename) {
    const handler: FileOptionHandler = await getFileOptionHandler(fileOption)

    const _inputDefinitions = await handler(fileOption)

    definitions.push(...safeLoadAll(_inputDefinitions) as Definition[])
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
      throw Error(`Given ${fileOption} is not a file or a directory.`)
    }
  } catch (e) {
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

export { inputDefinitions }

