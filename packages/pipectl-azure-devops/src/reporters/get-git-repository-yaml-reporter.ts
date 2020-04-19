import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { AzureGitRepository } from '../model/azure-git-repository'
import { GetGitRepositoryProcessResult } from '../model/get-git-repository-process-result'
import { GetReporterYaml } from './get-reporter-yaml'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportGitRepository } from './util/export-git-repository'
import { transformForGetReporting } from './util/get-reporting'

class GetGitRepositoryYamlReporter extends GetReporterYaml<
  GetGitRepositoryProcessResult,
  AzureGitRepository
> {
  constructor() {
    super(GetGitRepositoryProcessResult)
  }

  transform(
    processResult: GetGitRepositoryProcessResult,
    transformedDefinition: AzureGitRepository,
    _action: Action,
    args: GetArguments
  ): Promise<ReportingTransformationResult> {
    return transformForGetReporting(
      processResult,
      transformedDefinition,
      args,
      (definition) => applyExport(definition, exportGitRepository)
    )
  }
}

export { GetGitRepositoryYamlReporter }