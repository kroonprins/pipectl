import { ProcessResult, TransformedDefinition, Definition } from "../../core/model"
import { AzureReleaseDefinition } from "../model/azure-release-definition"
import { GetReleaseDefinitionProcessResult } from "../model/get-release-definition-process-result"
import { Action, CommonArguments, GetArguments } from "../../core/actions/model"

const transformGetReleaseDefinitionProcessResultForReporting = (processResult: ProcessResult, transformedDefinition: TransformedDefinition, action: Action, args: CommonArguments): object => {
  const azureReleaseDefinition = transformedDefinition as AzureReleaseDefinition
  const definitions: Definition[] = (processResult as GetReleaseDefinitionProcessResult).releaseDefinitions!
    .map(releaseDefinition => {
      return {
        apiVersion: azureReleaseDefinition.apiVersion,
        kind: azureReleaseDefinition.kind,
        metadata: {
          namespace: azureReleaseDefinition.project
        },
        spec: releaseDefinition,
      }
    })
    .map(definition => {
      if ((args as GetArguments).export) {
        return removeFieldsForExport(definition)
      }
      return definition
    })
  if (definitions.length > 1) {
    return {
      apiVersion: azureReleaseDefinition.apiVersion,
      items: definitions
    }
  } else {
    return definitions[0]
  }
}

/* tslint:disable:no-string-literal */
const removeFieldsForExport = (definition: Definition): Definition => {
  // TODO more elegant way :)
  const spec = definition.spec as any
  delete spec['source']
  delete spec['revision']
  delete spec['createdBy']
  delete spec['createdOn']
  delete spec['modifiedBy']
  delete spec['modifiedOn']
  delete spec['isDeleted']
  delete spec['url']
  for(const artifact of spec['artifacts']) {
    delete artifact['sourceId']
    delete artifact['definitionReference']['definition']['name']
    delete artifact['definitionReference']['project']['name']
    delete artifact['definitionReference']['artifactSourceDefinitionUrl']
  }
  for(const environment of spec['environments']) {
    delete environment['id']
    delete environment['rank']
    delete environment['owner']
    delete environment['deployStep']
    for(const deployPhase of environment['deployPhases']) {
      delete deployPhase['rank']
      delete deployPhase['refName']
      delete deployPhase['currentRelease']
      delete deployPhase['badgeUrl']
      for(const workflowTask of deployPhase['workflowTasks']) {
        delete workflowTask['refName']
      }
    }
  }

  return definition
}

export {
  transformGetReleaseDefinitionProcessResultForReporting
}
