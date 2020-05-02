import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { ProcessResult } from '@kroonprins/pipectl/dist/model'
import { Kind } from '../model'
import { AzureGitPullRequest } from '../model/azure-git-pull-request'
import { GetReporterJson } from './get-reporter-json'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportGitPullRequest } from './util/export-git-pull-request'
import { transformForGetReporting } from './util/get-reporting'

class GetGitPullRequestJsonReporter extends GetReporterJson {
  constructor() {
    super(Kind.GIT_PULL_REQUEST)
  }

  transform(
    processResult: ProcessResult,
    transformedDefinition: AzureGitPullRequest,
    _action: Action,
    args: GetArguments
  ): Promise<ReportingTransformationResult> {
    return transformForGetReporting(
      processResult,
      transformedDefinition.apiVersion,
      args,
      (definition) => applyExport(definition, exportGitPullRequest)
    )
  }
}

export { GetGitPullRequestJsonReporter }
