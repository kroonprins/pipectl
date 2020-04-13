import {
  Action,
  GetArguments,
} from '@kroonprins/pipectl-core/dist/actions/model'
import { AzureReleaseDefinition } from '../model/azure-release-definition'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'
import { GetReporterYaml } from './get-reporter-yaml'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportReleaseDefinition } from './util/export-release-definition'
import { transformForGetReporting } from './util/get-reporting'

class GetReleaseDefinitionYamlReporter extends GetReporterYaml<
  GetReleaseDefinitionProcessResult,
  AzureReleaseDefinition
> {
  constructor() {
    super(GetReleaseDefinitionProcessResult)
  }

  transform(
    processResult: GetReleaseDefinitionProcessResult,
    transformedDefinition: AzureReleaseDefinition,
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
          exportReleaseDefinition,
          transformedDefinition.project
        )
    )
  }
}

export { GetReleaseDefinitionYamlReporter }
