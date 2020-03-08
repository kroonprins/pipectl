
import { registerTransformer, registerActionProcessor } from "../core/registration";
import { BuildDefinitionTransformer, ReleaseDefinitionTransformer, ApplyReleaseDefinitionTransformer } from "./transformers";
import { ApplyReleaseDefinition, DeleteReleaseDefinition, GetAllReleaseDefinitions, GetOneReleaseDefinition } from "./processors";

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
}