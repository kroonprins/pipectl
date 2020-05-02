import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { ProcessResult } from '@kroonprins/pipectl/dist/model'
import { Kind } from '../model'
import { AzureTaskGroup } from '../model/azure-task-group'
import { GetReporterJson } from './get-reporter-json'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportTaskGroup } from './util/export-task-group'
import { transformForGetReporting } from './util/get-reporting'

class GetTaskGroupJsonReporter extends GetReporterJson {
  constructor() {
    super(Kind.TASK_GROUP)
  }

  transform(
    processResult: ProcessResult,
    transformedDefinition: AzureTaskGroup,
    _action: Action,
    args: GetArguments
  ): Promise<ReportingTransformationResult> {
    return transformForGetReporting(
      processResult,
      transformedDefinition.apiVersion,
      args,
      (definition) =>
        applyExport(definition, exportTaskGroup, transformedDefinition.project)
    )
  }
}

export { GetTaskGroupJsonReporter }
