import { Reporter, ProcessResult, TransformedDefinition } from "../core/model";
import { Action, CommonArguments } from "../core/actions/model";
import { GetReleaseDefinitionProcessResult } from "./model";

class GetReleaseDefinitionYamlReporter implements Reporter {
    canReport(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
        return false
    }
    async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

class GetReleaseDefinitionReporter implements Reporter {
    canReport(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): boolean {
        return processResult instanceof GetReleaseDefinitionProcessResult
    }
    async report(processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): Promise<void> {
        const getReleaseDefinitionProcessResult = processResult as GetReleaseDefinitionProcessResult
        console.log('NAME\tDESCRIPTON')
        getReleaseDefinitionProcessResult.releaseDefinitions!.forEach(releaseDefinition => {
            console.log(`${releaseDefinition.id}\t${releaseDefinition.path}\\${releaseDefinition.name}`)
        })
    }
}

export {
    GetReleaseDefinitionReporter
}