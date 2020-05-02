import { Action, GetArguments } from '@kroonprins/pipectl/dist/actions/model'
import { ProcessResult } from '@kroonprins/pipectl/dist/model'
import { Kind } from '../model'
import { AzureGitRepository } from '../model/azure-git-repository'
import { GetReporterYaml } from './get-reporter-yaml'
import { ReportingTransformationResult } from './model'
import { applyExport } from './util/export'
import { exportGitRepository } from './util/export-git-repository'
import { transformForGetReporting } from './util/get-reporting'

class GetGitRepositoryYamlReporter extends GetReporterYaml {
  constructor() {
    super(Kind.GIT_REPOSITORY)
  }

  transform(
    processResult: ProcessResult,
    transformedDefinition: AzureGitRepository,
    _action: Action,
    args: GetArguments
  ): Promise<ReportingTransformationResult> {
    return transformForGetReporting(
      processResult,
      transformedDefinition.apiVersion,
      args,
      (definition) => applyExport(definition, exportGitRepository)
    )
  }
}

export { GetGitRepositoryYamlReporter }
