import { GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { Definition, ProcessResult } from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { ReportingTransformationResult } from '../model'

const transformForGetReporting = async (
  processResult: ProcessResult,
  apiVersion: string,
  args: GetArguments,
  applyExport: (definition: object) => Promise<object>
): Promise<ReportingTransformationResult> => {
  const definitions: Definition[] = await Promise.all(
    processResult.results!.map(async (definition) => {
      if (args.export) {
        log.debug(
          `[transformForGetReporting apply export] before[${JSON.stringify(
            definition
          )}]`
        )
        definition.spec = await applyExport(definition.spec)
        log.debug(
          `[transformForGetReporting apply export] after[${JSON.stringify(
            definition
          )}]`
        )
      }
      return definition
    })
  )
  if (definitions.length > 1) {
    return {
      apiVersion,
      items: definitions,
    }
  } else {
    return definitions[0]
  }
}

export { transformForGetReporting }
