import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { AzureTaskGroup } from '../model/azure-task-group'
import { GetTaskGroupProcessResult } from '../model/get-task-group-process-result'
import { GetReporterJson } from './get-reporter-json'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportTaskGroup } from './util/export-task-group'
import { transformForGetReporting } from './util/get-reporting'

class GetTaskGroupJsonReporter extends GetReporterJson<
  GetTaskGroupProcessResult,
  AzureTaskGroup
> {
  constructor() {
    super(GetTaskGroupProcessResult)
  }

  transform(
    processResult: GetTaskGroupProcessResult,
    transformedDefinition: AzureTaskGroup,
    _action: Action,
    args: GetArguments
  ): Promise<ReportingTransformationResult> {
    return transformForGetReporting(
      processResult,
      transformedDefinition,
      args,
      (definition) =>
        applyExport(definition, exportTaskGroup, transformedDefinition.project)
    )
  }
}

export { GetTaskGroupJsonReporter }
