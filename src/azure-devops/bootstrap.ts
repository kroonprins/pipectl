
import { registerActionProcessor, registerGrouper, registerReporter, registerTransformer } from '../core/registration'
import { ApplyAzureDefinitionGrouper } from './groupers/apply-azure-definition-grouper'
import { AzureDefinitionGrouper } from './groupers/azure-definition-grouper'
import { ApplyBuildDefinition } from './processors/apply-build-definition'
import { ApplyReleaseDefinition } from './processors/apply-release-definition'
import { DeleteBuildDefinition } from './processors/delete-build-definition'
import { DeleteReleaseDefinition } from './processors/delete-release-definition'
import { GetAllBuildDefinitions } from './processors/get-all-build-definitions'
import { GetAllReleaseDefinitions } from './processors/get-all-release-definitions'
import { GetOneBuildDefinition } from './processors/get-one-build-definition'
import { GetOneReleaseDefinition } from './processors/get-one-release-definition'
import { GetBuildDefinitionJsonReporter } from './reporters/get-build-definition-json-reporter'
import { GetBuildDefinitionReporter } from './reporters/get-build-definition-reporter'
import { GetBuildDefinitionYamlReporter } from './reporters/get-build-definition-yaml-reporter'
import { GetReleaseDefinitionJsonReporter } from './reporters/get-release-definition-json-reporter'
import { GetReleaseDefinitionReporter } from './reporters/get-release-definition-reporter'
import { GetReleaseDefinitionYamlReporter } from './reporters/get-release-definition-yaml-reporter'
import { ApplyBuildDefinitionTransformer } from './transformers/apply-build-definition-transformer'
import { ApplyReleaseDefinitionTransformer } from './transformers/apply-release-definition-transformer'
import { BuildDefinitionTransformer } from './transformers/build-definition-transformer'
import { ReleaseDefinitionTransformer } from './transformers/release-definition-transformer'

export default () => {
  registerGrouper(
    new AzureDefinitionGrouper(),
    new ApplyAzureDefinitionGrouper(),
  )

  registerTransformer(
    new BuildDefinitionTransformer(),
    new ApplyBuildDefinitionTransformer(),
    new ReleaseDefinitionTransformer(),
    new ApplyReleaseDefinitionTransformer(),
  )

  registerActionProcessor(
    new ApplyBuildDefinition(),
    new DeleteBuildDefinition(),
    new GetAllBuildDefinitions(),
    new GetOneBuildDefinition(),
    new ApplyReleaseDefinition(),
    new DeleteReleaseDefinition(),
    new GetAllReleaseDefinitions(),
    new GetOneReleaseDefinition(),
  )

  registerReporter(
    new GetBuildDefinitionReporter(),
    new GetBuildDefinitionYamlReporter(),
    new GetBuildDefinitionJsonReporter(),
    new GetReleaseDefinitionReporter(),
    new GetReleaseDefinitionYamlReporter(),
    new GetReleaseDefinitionJsonReporter(),
  )
}
