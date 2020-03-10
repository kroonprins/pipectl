
import { registerTransformer, registerActionProcessor, registerReporter } from "../core/registration"
import { ReleaseDefinitionTransformer } from "./transformers/release-definition-transformer"
import { ApplyReleaseDefinition } from "./processors/apply-release-definition"
import { GetOneReleaseDefinition } from "./processors/get-one-release-definition"
import { GetAllReleaseDefinitions } from "./processors/get-all-release-definitions"
import { DeleteReleaseDefinition } from "./processors/delete-release-definition"
import { GetReleaseDefinitionReporter } from "./reporters/get-release-definition-reporter"
import { BuildDefinitionTransformer } from "./transformers/build-definition-transformer"
import { ApplyReleaseDefinitionTransformer } from "./transformers/apply-release-definition-transformer"
import { GetReleaseDefinitionYamlReporter } from "./reporters/get-release-definition-yaml-reporter"
import { GetReleaseDefinitionJsonReporter } from "./reporters/get-release-definition-json-reporter"
import { GetAllBuildDefinitions } from "./processors/get-all-build-definitions"
import { GetBuildDefinitionReporter } from "./reporters/get-build-definition-reporter"
import { GetOneBuildDefinition } from "./processors/get-one-build-definition"
import { GetBuildDefinitionJsonReporter } from "./reporters/get-build-definition-json-reporter"
import { GetBuildDefinitionYamlReporter } from "./reporters/get-build-definition-yaml-reporter"
import { ApplyBuildDefinition } from "./processors/apply-build-definition"
import { DeleteBuildDefinition } from "./processors/delete-build-definition"
import { ApplyBuildDefinitionTransformer } from "./transformers/apply-build-definition-transformer"

export default () => {
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
