import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { ProcessResult } from '@kroonprins/pipectl/dist/model'
import { Kind } from '../model'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { GetReporterJson } from './get-reporter-json'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportBuildDefinition } from './util/export-build-definition'
import { transformForGetReporting } from './util/get-reporting'

class GetBuildDefinitionJsonReporter extends GetReporterJson {
  constructor() {
    super(Kind.BUILD_DEFINITION)
  }

  transform(
    processResult: ProcessResult,
    transformedDefinition: AzureBuildDefinition,
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
          exportBuildDefinition,
          transformedDefinition.project
        )
    )
  }
}

export { GetBuildDefinitionJsonReporter }
