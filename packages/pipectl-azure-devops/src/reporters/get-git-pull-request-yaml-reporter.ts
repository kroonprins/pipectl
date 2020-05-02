import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { ProcessResult } from '@kroonprins/pipectl/dist/model'
import { Kind } from '../model'
import { AzureGitPullRequest } from '../model/azure-git-pull-request'
import { GetReporterYaml } from './get-reporter-yaml'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportGitPullRequest } from './util/export-git-pull-request'
import { transformForGetReporting } from './util/get-reporting'

class GetGitPullRequestYamlReporter extends GetReporterYaml {
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

export { GetGitPullRequestYamlReporter }
