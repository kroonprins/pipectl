import { GetArguments } from "pipectl-core/dist/actions/model"
import { Definition } from "pipectl-core/dist/model"
import { log } from "pipectl-core/dist/util/logging"
import { AzureDefinition } from "../../model"
import { GetProcessResult } from "../../model/get-process-result"
import { ReportingTransformationResult } from "../model"

const transformForGetReporting = async <U extends GetProcessResult<any>, V extends AzureDefinition<any>>(processResult: U, transformedDefinition: V, args: GetArguments, applyExport: (definition: V) => Promise<V>): Promise<ReportingTransformationResult> => {
  const definitions: Definition[] = await Promise.all(
    processResult.results!
      .map(definition => {
        return {
          apiVersion: transformedDefinition.apiVersion,
          kind: transformedDefinition.kind,
          metadata: {
            namespace: transformedDefinition.project
          },
          spec: definition,
        }
      })
      .map(async definition => {
        if (args.export) {
          log.debug(`[transformForGetReporting apply export] before[${JSON.stringify(definition)}]`)
          definition.spec = await applyExport(definition.spec)
          log.debug(`[transformForGetReporting apply export] after[${JSON.stringify(definition)}]`)
        }
        return definition
      })
  )
  if (definitions.length > 1) {
    return {
      apiVersion: transformedDefinition.apiVersion,
      items: definitions
    }
  } else {
    return definitions[0]
  }
}

export { transformForGetReporting }

