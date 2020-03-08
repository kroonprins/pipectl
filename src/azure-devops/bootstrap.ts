
import { registerTransformer, registerActionProcessor } from "../core/registration";
import { BuildDefinitionTransformer, ReleaseDefinitionTransformer } from "./transformers";
import { ApplyReleaseDefinition, DeleteReleaseDefinition, GetAllReleaseDefinitions, GetOneReleaseDefinition } from "./processors";

export default () => {
    registerTransformer(
        new BuildDefinitionTransformer(),
        new ReleaseDefinitionTransformer(),
    )

    registerActionProcessor(
        new ApplyReleaseDefinition(),
        new DeleteReleaseDefinition(),
        new GetAllReleaseDefinitions(),
        new GetOneReleaseDefinition(),
    )
}