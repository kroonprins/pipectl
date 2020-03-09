import { TransformedDefinition, ProcessResult } from "../core/model";
import { BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";

abstract class AzureDefinition<T> implements TransformedDefinition {
    constructor(
        public apiVersion: string, // TODO public?
        public kind: string,
        public project: string,
        public spec: T
    ) { }

    abstract uniqueId(): string;
}

class AzureBuildDefinition extends AzureDefinition<BuildDefinition> {
    uniqueId(): string {
        return `${this.kind}${this.project}${this.spec.name}${this.spec.path}`
    }
}

class AzureReleaseDefinition extends AzureDefinition<ReleaseDefinition> {
    uniqueId(): string {
        return `${this.kind}${this.project}${this.spec.name}${this.spec.path}`
    }
}

interface GetReleaseDefinitionProcessResult extends ProcessResult {
    releaseDefinitions?: ReleaseDefinition[]
}

enum Kind {
    BUILD_DEFINITION = "BuildDefinition",
    RELEASE_DEFINITION = "ReleaseDefinition",
}

export {
    AzureBuildDefinition,
    AzureReleaseDefinition,
    GetReleaseDefinitionProcessResult,
    Kind
}