import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'
import { GetReporterYaml } from './get-reporter-yaml'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportBuildDefinition } from './util/export-build-definition'
import { transformForGetReporting } from './util/get-reporting'

class GetBuildDefinitionYamlReporter extends GetReporterYaml<
  GetBuildDefinitionProcessResult,
  AzureBuildDefinition
> {
  constructor() {
    super(GetBuildDefinitionProcessResult)
  }

  transform(
    processResult: GetBuildDefinitionProcessResult,
    transformedDefinition: AzureBuildDefinition,
    _action: Action,
    args: GetArguments
  ): Promise<ReportingTransformationResult> {
    return transformForGetReporting(
      processResult,
      transformedDefinition,
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

export { GetBuildDefinitionYamlReporter }
