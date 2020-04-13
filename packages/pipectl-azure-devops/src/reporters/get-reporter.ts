import {
  Action,
  GetArguments,
} from '@kroonprins/pipectl-core/dist/actions/model'
import {
  Reporter,
  TransformedDefinition,
} from '@kroonprins/pipectl-core/dist/model'
import { log } from '@kroonprins/pipectl-core/dist/util/logging'
import { GetProcessResult } from '../model/get-process-result'

abstract class GetReporter<
  U extends GetProcessResult<W>,
  V extends TransformedDefinition,
  W
> implements Reporter {
  constructor(private transformedDefinitionType: new () => U) {}

  canReport(
    processResult: U,
    _transformedDefinition: V,
    _action: Action,
    args: GetArguments
  ): boolean {
    const result =
      processResult instanceof this.transformedDefinitionType && !args.output
    log.debug(
      `[GetReporter] canReport[${result}], processResult[${JSON.stringify(
        processResult
      )}], args[${args}]`
    )
    return result
  }

  async report(
    processResult: U,
    transformedDefinition: V,
    _action: Action,
    _args: GetArguments
  ): Promise<void> {
    log.debug(
      `[GetReporter] processResult[${JSON.stringify(
        processResult
      )}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`
    )

    const columns = this.columns()
    log.info(columns.join('\t'))
    processResult.results!.forEach((result) => {
      const line = this.line(result)
      const formatted = columns.reduce(
        (p: string, column: string) => p + line[column] + '\t',
        ''
      )
      log.info(formatted)
    })
  }

  abstract columns(): string[]
  abstract line(result: W): { [column: string]: string }
}

export { GetReporter }
