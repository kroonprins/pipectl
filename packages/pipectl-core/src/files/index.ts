import { promises as fs } from 'fs'
import readStdin from 'get-stdin'
import g from 'glob'
import util from 'util'
import { CommonArguments as Arguments } from '../actions/model'
import { Definition } from '../model'
import { JsonContentFileHandler, JsonExtensionFileHandler } from './files-json'
import { YamlContentFileHandler, YamlExtensionFileHandler } from './files-yaml'
import {
  DefinitionFile,
  DefinitionFileHandler,
  FileName,
  FileOptionHandler,
} from './model'

const glob = util.promisify(g)

const definitionFileHandlers: DefinitionFileHandler[] = [
  new YamlExtensionFileHandler(),
  new JsonExtensionFileHandler(),
  new YamlContentFileHandler(),
  new JsonContentFileHandler(),
]

const inputDefinitions = async (args: Arguments) => {
  if (!(args.filename && args.filename.length)) {
    // throw new Error('-f option missing')
    args.filename = ['-'] // seems a bug in yargs that it does not handle "-f -" as expected
  }

  const definitions: Definition[] = []
  for (const fileOption of args.filename) {
    const fileOptionHandler: FileOptionHandler = await getFileOptionHandler(
      fileOption
    )

    const definitionFiles = await fileOptionHandler(fileOption, args)

    for (const definitionFile of definitionFiles) {
      const definitionFileHandler = getDefinitionFileHandler(definitionFile)
      definitions.push(...(await definitionFileHandler.handle(definitionFile)))
    }
  }
  return definitions
}

const getFileOptionHandler = async (fileOption: string) => {
  if (fileOption === '-') {
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

const stdin: FileOptionHandler = async () => {
  return [{ content: await readStdin() }]
}

const file: FileOptionHandler = async (fileOption: string) => {
  const buffer = await fs.readFile(fileOption)
  return [{ name: new FileName(fileOption), content: buffer.toString() }]
}

const directory: FileOptionHandler = async (
  fileOption: string,
  args: Arguments
) => {
  const pattern = args.recursive
    ? `${fileOption}/**/*@(.yaml|.yml|.json)`
    : `${fileOption}/*@(.yaml|.yml|.json)`
  const files = await glob(pattern, { nodir: true })
  return (
    await Promise.all(files.map(async (foundFile) => file(foundFile, args)))
  ).flat()
}

const getDefinitionFileHandler = (
  definitionFile: DefinitionFile
): DefinitionFileHandler => {
  const handler = definitionFileHandlers.find((definitionFileHandler) =>
    definitionFileHandler.canHandle(definitionFile)
  )
  if (!handler) {
    throw new Error(
      `No handler found for file name[${definitionFile.name?.name}], content[${definitionFile.content}]`
    )
  }
  return handler
}

export { inputDefinitions }
