import {
  registerActionProcessor,
  registerGrouper,
  registerReporter,
  registerTransformer,
} from '@kroonprins/pipectl/dist/registration'
import { Argv } from 'yargs'
import { ApplyAzureDefinitionGrouper } from './groupers/apply-azure-definition-grouper'
import { AzureDefinitionGrouper } from './groupers/azure-definition-grouper'
import { ApplyBuildDefinition } from './processors/apply-build-definition'
import { ApplyGitPullRequest } from './processors/apply-git-pull-request'
import { ApplyGitRepository } from './processors/apply-git-repository'
import { ApplyReleaseDefinition } from './processors/apply-release-definition'
import { ApplyVariableGroup } from './processors/apply-variable-group'
import { DeleteBuildDefinition } from './processors/delete-build-definition'
import { DeleteGitPullRequest } from './processors/delete-git-pull-request'
import { DeleteGitRepository } from './processors/delete-git-repository'
import { DeleteReleaseDefinition } from './processors/delete-release-definition'
import { DeleteVariableGroup } from './processors/delete-variable-group'
import { GetAllBuildDefinitions } from './processors/get-all-build-definitions'
import { GetAllGitPullRequests } from './processors/get-all-git-pull-requests'
import { GetAllGitRepositories } from './processors/get-all-git-repositories'
import { GetAllReleaseDefinitions } from './processors/get-all-release-definitions'
import { GetAllVariableGroups } from './processors/get-all-variable-groups'
import { GetOneBuildDefinition } from './processors/get-one-build-definition'
import { GetOneGitPullRequest } from './processors/get-one-git-pull-request'
import { GetOneGitRepository } from './processors/get-one-git-repository'
import { GetOneReleaseDefinition } from './processors/get-one-release-definition'
import { GetOneVariableGroup } from './processors/get-one-variable-group'
import { GetBuildDefinitionJsonReporter } from './reporters/get-build-definition-json-reporter'
import { GetBuildDefinitionReporter } from './reporters/get-build-definition-reporter'
import { GetBuildDefinitionYamlReporter } from './reporters/get-build-definition-yaml-reporter'
import { GetGitPullRequestJsonReporter } from './reporters/get-git-pull-request-json-reporter'
import { GetGitPullRequestReporter } from './reporters/get-git-pull-request-reporter'
import { GetGitPullRequestYamlReporter } from './reporters/get-git-pull-request-yaml-reporter'
import { GetGitRepositoryJsonReporter } from './reporters/get-git-repository-json-reporter'
import { GetGitRepositoryReporter } from './reporters/get-git-repository-reporter'
import { GetGitRepositoryYamlReporter } from './reporters/get-git-repository-yaml-reporter'
import { GetReleaseDefinitionJsonReporter } from './reporters/get-release-definition-json-reporter'
import { GetReleaseDefinitionReporter } from './reporters/get-release-definition-reporter'
import { GetReleaseDefinitionYamlReporter } from './reporters/get-release-definition-yaml-reporter'
import { GetVariableGroupJsonReporter } from './reporters/get-variable-group-json-reporter'
import { GetVariableGroupReporter } from './reporters/get-variable-group-reporter'
import { GetVariableGroupYamlReporter } from './reporters/get-variable-group-yaml-reporter'
import { ApplyBuildDefinitionTransformer } from './transformers/apply-build-definition-transformer'
import { ApplyGitPullRequestTransformer } from './transformers/apply-git-pull-request-transformer'
import { ApplyGitRepositoryTransformer } from './transformers/apply-git-repository-transformer'
import { ApplyReleaseDefinitionTransformer } from './transformers/apply-release-definition-transformer'
import { ApplyVariableGroupTransformer } from './transformers/apply-variable-group-transformer'
import { BuildDefinitionTransformer } from './transformers/build-definition-transformer'
import { DeleteGitPullRequestTransformer } from './transformers/delete-git-pull-request-transformer'
import { GitPullRequestTransformer } from './transformers/git-pull-request-transformer'
import { GitRepositoryTransformer } from './transformers/git-repository-transformer'
import { ReleaseDefinitionTransformer } from './transformers/release-definition-transformer'
import { VariableGroupTransformer } from './transformers/variable-group-transformer'

export default (_yargs: Argv) => {
  registerGrouper(
    new AzureDefinitionGrouper(),
    new ApplyAzureDefinitionGrouper()
  )

  registerTransformer(
    new VariableGroupTransformer(),
    new ApplyVariableGroupTransformer(),
    new GitRepositoryTransformer(),
    new ApplyGitRepositoryTransformer(),
    new GitPullRequestTransformer(),
    new ApplyGitPullRequestTransformer(),
    new DeleteGitPullRequestTransformer(),
    new BuildDefinitionTransformer(),
    new ApplyBuildDefinitionTransformer(),
    new ReleaseDefinitionTransformer(),
    new ApplyReleaseDefinitionTransformer()
  )

  registerActionProcessor(
    new GetAllVariableGroups(),
    new GetOneVariableGroup(),
    new ApplyVariableGroup(),
    new DeleteVariableGroup(),
    new GetAllGitRepositories(),
    new GetOneGitRepository(),
    new ApplyGitRepository(),
    new DeleteGitRepository(),
    new GetAllGitPullRequests(),
    new GetOneGitPullRequest(),
    new ApplyGitPullRequest(),
    new DeleteGitPullRequest(),
    new ApplyBuildDefinition(),
    new DeleteBuildDefinition(),
    new GetAllBuildDefinitions(),
    new GetOneBuildDefinition(),
    new ApplyReleaseDefinition(),
    new DeleteReleaseDefinition(),
    new GetAllReleaseDefinitions(),
    new GetOneReleaseDefinition()
  )

  registerReporter(
    new GetVariableGroupReporter(),
    new GetVariableGroupYamlReporter(),
    new GetVariableGroupJsonReporter(),
    new GetGitRepositoryReporter(),
    new GetGitRepositoryYamlReporter(),
    new GetGitRepositoryJsonReporter(),
    new GetGitPullRequestReporter(),
    new GetGitPullRequestYamlReporter(),
    new GetGitPullRequestJsonReporter(),
    new GetBuildDefinitionReporter(),
    new GetBuildDefinitionYamlReporter(),
    new GetBuildDefinitionJsonReporter(),
    new GetReleaseDefinitionReporter(),
    new GetReleaseDefinitionYamlReporter(),
    new GetReleaseDefinitionJsonReporter()
  )
}
