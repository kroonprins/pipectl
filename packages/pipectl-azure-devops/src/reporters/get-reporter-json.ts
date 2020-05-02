import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ProcessResult,
  Reporter,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { ReportingTransformationResult } from './model'

abstract class GetReporterJson implements Reporter {
  constructor(private type: string) {}

  canReport(
    processResult: ProcessResult,
    _transformedDefinition: TransformedDefinition,
    _action: Action,
    args: GetArguments
  ): boolean {
    const result =
      processResult.properties?.type === this.type && args.output === 'json'
    log.debug(
      `[GetReporterJson] canReport[${result}], processResult[${JSON.stringify(
        processResult
      )}], args[${args}]`
    )
    return result
  }

  async report(
    processResult: ProcessResult,
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): Promise<void> {
    log.debug(
      `[GetReporterJson] processResult[${JSON.stringify(
        processResult
      )}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`
    )
    log.info(
      JSON.stringify(
        await this.transform(
          processResult,
          transformedDefinition,
          action,
          args
        ),
        undefined,
        2
      )
    )
  }

  abstract transform(
    processResult: ProcessResult,
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: GetArguments
  ): Promise<ReportingTransformationResult>
}

export { GetReporterJson }
