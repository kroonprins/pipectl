import { safeDump } from 'js-yaml'
import { Action, GetArguments } from 'pipectl-core/dist/actions/model'
import { ProcessResult, Reporter, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { ReportingTransformationResult } from './model'

abstract class GetReporterYaml<U extends ProcessResult, V extends TransformedDefinition> implements Reporter {

  constructor(private transformedDefinitionType: new() => U) { }

  canReport(processResult: U, _transformedDefinition: V, _action: Action, args: GetArguments): boolean {
    const result = processResult instanceof this.transformedDefinitionType && args.output === 'yaml'
    log.debug(`[GetReporterYaml] canReport[${result}], processResult[${JSON.stringify(processResult)}], args[${args}]`)
    return result
  }

  async report(processResult: U, transformedDefinition: V, action: Action, args: GetArguments): Promise<void> {
    log.debug(`[GetReporterYaml] processResult[${JSON.stringify(processResult)}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`)
    log.info(safeDump(await this.transform(processResult, transformedDefinition, action, args)))
  }

  abstract transform(processResult: U, transformedDefinition: V, action: Action, args: GetArguments): Promise<ReportingTransformationResult>
}

export { GetReporterYaml }

