import { Action, GetArguments } from '@kroonprins/pipectl-core/dist/actions/model'
import { AzureVariableGroup } from '../model/azure-variable-group'
import { GetVariableGroupProcessResult } from '../model/get-variable-group-process-result'
import { GetReporterYaml } from './get-reporter-yaml'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportVariableGroup } from './util/export-variable-group'
import { transformForGetReporting } from './util/get-reporting'

class GetVariableGroupYamlReporter extends GetReporterYaml<GetVariableGroupProcessResult, AzureVariableGroup> {
  constructor() { super(GetVariableGroupProcessResult) }

  transform(processResult: GetVariableGroupProcessResult, transformedDefinition: AzureVariableGroup, _action: Action, args: GetArguments): Promise<ReportingTransformationResult> {
    return transformForGetReporting(processResult, transformedDefinition, args, (definition) => applyExport(definition, exportVariableGroup))
  }
}

export { GetVariableGroupYamlReporter }

