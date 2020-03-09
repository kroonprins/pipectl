
import { registerTransformer, registerActionProcessor, registerReporter } from "../core/registration"
import { ReleaseDefinitionTransformer } from "./transformers/release-definition-transformer"
import { ApplyReleaseDefinition } from "./processors/apply-release-definition"
import { GetOneReleaseDefinition } from "./processors/get-one-release-definition"
import { GetAllReleaseDefinitions } from "./processors/get-all-release-definitions"
import { DeleteReleaseDefinition } from "./processors/delete-release-definition"
import { GetReleaseDefinitionReporter } from "./reporters/get-release-definition-reporter"
import { BuildDefinitionTransformer } from "./transformers/build-definition-transformer"
import { ApplyReleaseDefinitionTransformer } from "./transformers/apply-release-definition-transformer"

export default () => {
  registerTransformer(
    new BuildDefinitionTransformer(),
    new ReleaseDefinitionTransformer(),
    new ApplyReleaseDefinitionTransformer(),
  )

  registerActionProcessor(
    new ApplyReleaseDefinition(),
    new DeleteReleaseDefinition(),
    new GetAllReleaseDefinitions(),
    new GetOneReleaseDefinition(),
  )

  registerReporter(
    new GetReleaseDefinitionReporter(),
  )
}
