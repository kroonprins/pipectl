import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { Reporter, TransformedDefinition } from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import columnify from 'columnify'
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
    const lines = processResult.results!.map((result) => this.line(result))
    log.info(
      columnify(lines, {
        columns,
        ...this.options(),
      })
    )
  }

  abstract columns(): string[]
  abstract line(result: W): { [column: string]: string | undefined }
  options() {
    return {}
  }
}

export { GetReporter }
