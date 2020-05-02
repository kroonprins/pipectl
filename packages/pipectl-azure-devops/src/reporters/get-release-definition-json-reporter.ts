import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { ProcessResult } from '@kroonprins/pipectl/dist/model'
import { Kind } from '../model'
import { AzureReleaseDefinition } from '../model/azure-release-definition'
import { GetReporterJson } from './get-reporter-json'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportReleaseDefinition } from './util/export-release-definition'
import { transformForGetReporting } from './util/get-reporting'

class GetReleaseDefinitionJsonReporter extends GetReporterJson {
  constructor() {
    super(Kind.RELEASE_DEFINITION)
  }

  transform(
    processResult: ProcessResult,
    transformedDefinition: AzureReleaseDefinition,
    _action: Action,
    args: GetArguments
  ): Promise<ReportingTransformationResult> {
    return transformForGetReporting(
      processResult,
      transformedDefinition.apiVersion,
      args,
      (definition) =>
        applyExport(
          definition,
          exportReleaseDefinition,
          transformedDefinition.project
        )
    )
  }
}

export { GetReleaseDefinitionJsonReporter }
