import { safeLoadAll } from 'js-yaml'
import { Definition } from '../model'
import { DefinitionFile, DefinitionFileHandler } from './model'

/* tslint:disable:max-classes-per-file */

abstract class YamlFileHandler implements DefinitionFileHandler {
  abstract canHandle(file: DefinitionFile): boolean

  async handle(file: DefinitionFile): Promise<Definition[]> {
    return safeLoadAll(file.content) as Definition[]
  }
}

class YamlExtensionFileHandler extends YamlFileHandler {
  canHandle(file: DefinitionFile): boolean {
    return (
      file.name !== undefined &&
      (file.name.extension === 'yaml' || file.name.extension === 'yml')
    )
  }
}

class YamlContentFileHandler extends YamlFileHandler {
  canHandle(file: DefinitionFile): boolean {
    try {
      safeLoadAll(file.content)
      return true
    } catch (e) {
      return false
    }
  }
}

export { YamlExtensionFileHandler, YamlContentFileHandler }
