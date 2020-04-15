import parseJson from 'parse-json'
import stripJsonComments from 'strip-json-comments'
import { Definition } from '../model'
import { DefinitionFile, DefinitionFileHandler } from './model'

/* tslint:disable:max-classes-per-file */

abstract class JsonFileHandler implements DefinitionFileHandler {
  abstract canHandle(file: DefinitionFile): boolean

  async handle(file: DefinitionFile): Promise<Definition[]> {
    // TODO kubectl allows multiple resources in one file for json like this https://github.com/kubernetes/kubernetes/blob/master/hack/testdata/multi-resource-json.json
    const parsed = parseJson(stripJsonComments(file.content))
    return parsed.hasOwnProperty('items')
      ? (parsed.items as Definition[])
      : [parsed as Definition]
  }
}

class JsonExtensionFileHandler extends JsonFileHandler {
  canHandle(file: DefinitionFile): boolean {
    return file.name !== undefined && file.name.extension === 'json'
  }
}

class JsonContentFileHandler extends JsonFileHandler {
  canHandle(file: DefinitionFile): boolean {
    try {
      parseJson(stripJsonComments(file.content))
      return true
    } catch (e) {
      return false
    }
  }
}

export { JsonExtensionFileHandler, JsonContentFileHandler }
