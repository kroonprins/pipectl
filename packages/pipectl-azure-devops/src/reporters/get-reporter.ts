import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  ProcessResult,
  Reporter,
  TransformedDefinition,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import columnify from 'columnify'

abstract class GetReporter<T> implements Reporter {
  constructor(private type: string) {}

  canReport(
    processResult: ProcessResult,
    _transformedDefinition: TransformedDefinition,
    _action: Action,
    args: GetArguments
  ): boolean {
    const result = processResult.properties?.type === this.type && !args.output
    log.debug(
      `[GetReporter] canReport[${result}], processResult[${JSON.stringify(
        processResult
      )}], args[${args}]`
    )
    return result
  }

  async report(
    processResult: ProcessResult,
    transformedDefinition: TransformedDefinition,
    _action: Action,
    _args: GetArguments
  ): Promise<void> {
    log.debug(
      `[GetReporter] processResult[${JSON.stringify(
        processResult
      )}], transformedDefinition[${JSON.stringify(transformedDefinition)}]`
    )

    const columns = this.columns()
    const lines = processResult.results!.map((result) =>
      this.line((result.spec as unknown) as T)
    )
    log.info(
      columnify(lines, {
        columns,
        ...this.options(),
      })
    )
  }

  abstract columns(): string[]
  abstract line(result: T): { [column: string]: string | undefined }
  options() {
    return {}
  }
}

export { GetReporter }
