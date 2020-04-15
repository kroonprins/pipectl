import { CommonArguments as Arguments } from '../actions/model'
import { Definition } from '../model'

class FileName {
  public extension: string | undefined
  constructor(public name: string) {
    this.extension = name.split('.').pop()
  }
}

interface DefinitionFile {
  name?: FileName
  content: string
}

type FileOptionHandler = (
  fileOption: string,
  args: Arguments
) => Promise<DefinitionFile[]>

interface DefinitionFileHandler {
  canHandle(file: DefinitionFile): boolean
  handle(file: DefinitionFile): Promise<Definition[]>
}

export { FileName, DefinitionFile, FileOptionHandler, DefinitionFileHandler }
