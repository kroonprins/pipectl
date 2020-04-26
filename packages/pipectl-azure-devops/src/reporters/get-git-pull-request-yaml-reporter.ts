import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { AzureGitPullRequest } from '../model/azure-git-pull-request'
import { GetGitPullRequestProcessResult } from '../model/get-git-pull-request-process-result'
import { GetReporterYaml } from './get-reporter-yaml'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportGitPullRequest } from './util/export-git-pull-request'
import { transformForGetReporting } from './util/get-reporting'

class GetGitPullRequestYamlReporter extends GetReporterYaml<
  GetGitPullRequestProcessResult,
  AzureGitPullRequest
> {
  constructor() {
    super(GetGitPullRequestProcessResult)
  }

  transform(
    processResult: GetGitPullRequestProcessResult,
    transformedDefinition: AzureGitPullRequest,
    _action: Action,
    args: GetArguments
  ): Promise<ReportingTransformationResult> {
    return transformForGetReporting(
      processResult,
      transformedDefinition,
      args,
      (definition) => applyExport(definition, exportGitPullRequest)
    )
  }
}

export { GetGitPullRequestYamlReporter }
