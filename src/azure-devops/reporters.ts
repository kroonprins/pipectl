import { Reporter, ProcessResult, TransformedDefinition } from "../core/model";
import { Action, CommonArguments } from "../core/actions/model";
import { GetReleaseDefinitionProcessResult } from "./model";

class GetOneReleaseDefinitionYamlReporter implements Reporter {
    canReport(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
        return false
    }
    async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

class GetOneReleaseDefinitionReporter implements Reporter {
    canReport(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
        return ("releaseDefinition" in processResult) // TODO...
    }
    async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
        const getReleaseDefinitionProcessResult = processResult as GetReleaseDefinitionProcessResult
        if (getReleaseDefinitionProcessResult.releaseDefinition) { // TODO if not error
            console.log('NAME\tDESCRIPTON')
            console.log(`${getReleaseDefinitionProcessResult.releaseDefinition.id}\t${getReleaseDefinitionProcessResult.releaseDefinition.path}\\${getReleaseDefinitionProcessResult.releaseDefinition.name}`)
        }
    }
}

export {
    GetOneReleaseDefinitionReporter
}