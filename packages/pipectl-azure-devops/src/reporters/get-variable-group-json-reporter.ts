import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { ProcessResult } from '@kroonprins/pipectl/dist/model'
import { Kind } from '../model'
import { AzureVariableGroup } from '../model/azure-variable-group'
import { GetReporterJson } from './get-reporter-json'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportVariableGroup } from './util/export-variable-group'
import { transformForGetReporting } from './util/get-reporting'

class GetVariableGroupJsonReporter extends GetReporterJson {
  constructor() {
    super(Kind.VARIABLE_GROUP)
  }

  transform(
    processResult: ProcessResult,
    transformedDefinition: AzureVariableGroup,
    _action: Action,
    args: GetArguments
  ): Promise<ReportingTransformationResult> {
    return transformForGetReporting(
      processResult,
      transformedDefinition.apiVersion,
      args,
      (definition) => applyExport(definition, exportVariableGroup)
    )
  }
}

export { GetVariableGroupJsonReporter }
