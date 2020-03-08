import { DefinitionTransformer, Definition, TransformedDefinition } from "../core/model";
import { isAzureDevOps } from "./util";
import { Kind, AzureReleaseDefinition, AzureBuildDefinition } from './model'

class BuildDefinitionTransformer implements DefinitionTransformer {
    canTransform(definition: Definition): boolean {
        return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.BUILD_DEFINITION
    }
    transform(definition: Definition): TransformedDefinition {
        return new AzureBuildDefinition(
            definition.apiVersion,
            definition.kind,
            definition.metadata.namespace,
            definition.spec
        )
    }
}

class ReleaseDefinitionTransformer implements DefinitionTransformer {
    canTransform(definition: Definition): boolean {
        return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.RELEASE_DEFINITION
    }
    transform(definition: Definition): TransformedDefinition {
        return new AzureReleaseDefinition(
            definition.apiVersion,
            definition.kind,
            definition.metadata.namespace,
            definition.spec
        )
    }
}

export {
    BuildDefinitionTransformer,
    ReleaseDefinitionTransformer
}