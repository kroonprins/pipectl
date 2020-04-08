import { Action, GetArguments } from 'pipectl-core/dist/actions/model'
import { Definition, ProcessResult, TransformedDefinition } from 'pipectl-core/dist/model'
import { log } from 'pipectl-core/dist/util/logging'
import { AzureBuildDefinition } from '../model/azure-build-definition'
import { AzureReleaseDefinition } from '../model/azure-release-definition'
import { GetBuildDefinitionProcessResult } from '../model/get-build-definition-process-result'
import { GetReleaseDefinitionProcessResult } from '../model/get-release-definition-process-result'

const transformGetBuildDefinitionProcessResultForReporting = (processResult: ProcessResult, transformedDefinition: TransformedDefinition, _action: Action, args: GetArguments): object => {
  const azureBuildDefinition = transformedDefinition as AzureBuildDefinition
  const definitions: Definition[] = (processResult as GetBuildDefinitionProcessResult).buildDefinitions!
    .map(buildDefinition => {
      return {
        apiVersion: azureBuildDefinition.apiVersion,
        kind: azureBuildDefinition.kind,
        metadata: {
          namespace: azureBuildDefinition.project
        },
        spec: buildDefinition,
      }
    })
    .map(definition => { // TODO
      if (args.export) {
        return removeFieldsFromBuildDefinitionForExport(definition)
      }
      return definition
    })
  if (definitions.length > 1) {
    return {
      apiVersion: azureBuildDefinition.apiVersion,
      items: definitions
    }
  } else {
    return definitions[0]
  }
}

// TODO remove fields that are equal to default values
/* tslint:disable:no-string-literal */
const removeFieldsFromBuildDefinitionForExport = (definition: Definition): Definition => {
  log.debug(`[removeFieldsFromBuildDefinitionForExport] before[${JSON.stringify(definition)}]`)
  // TODO more elegant way :)
  const spec = definition.spec as any
  delete spec['id']
  delete spec['_links']
  if (spec.hasOwnProperty('variableGroups')) {
    for (const variableGroup of spec['variableGroups']) {
      delete variableGroup['variables']
      delete variableGroup['type']
      delete variableGroup['name'] // TODO update when variable groups can be specified by name
    }
  }
  delete spec['authoredBy']
  delete spec['url']
  delete spec['uri']
  delete spec['queueStatus']
  delete spec['revision']
  delete spec['createdDate']
  delete spec['project']['name'] // TODO update when variable groups can be specified by name
  delete spec['project']['url']
  delete spec['project']['state']
  delete spec['project']['revision']
  delete spec['project']['visibility']
  delete spec['project']['lastUpdateTime']
  delete spec['queue']['_links']
  delete spec['queue']['name']
  delete spec['queue']['url']
  delete spec['queue']['pool']
  delete spec['repository']['name']
  delete spec['repository']['url']

  for (const phase of spec['process']['phases']) {
    delete phase['refName']
    for (const step of phase['steps']) {
      delete step['refName']
      delete step['condition']
      delete phase['refName']
      delete phase['refName']
    }
  }

  log.debug(`[removeFieldsFromBuildDefinitionForExport] after[${JSON.stringify(definition)}]`)
  return definition
}

const transformGetReleaseDefinitionProcessResultForReporting = (processResult: ProcessResult, transformedDefinition: TransformedDefinition, _action: Action, args: GetArguments): object => {
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
      if (args.export) {
        return removeFieldsFromReleaseDefinitionForExport(definition)
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
const removeFieldsFromReleaseDefinitionForExport = (definition: Definition): Definition => {
  log.debug(`[removeFieldsFromReleaseDefinitionForExport] before[${JSON.stringify(definition)}]`)
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
  for (const artifact of spec['artifacts']) {
    delete artifact['sourceId']
    delete artifact['definitionReference']['definition']['name']
    delete artifact['definitionReference']['project']['name']
    delete artifact['definitionReference']['artifactSourceDefinitionUrl']
  }
  for (const environment of spec['environments']) {
    delete environment['id']
    delete environment['rank']
    delete environment['owner']
    delete environment['deployStep']
    delete environment['currentRelease']
    delete environment['badgeUrl']
    for (const deployPhase of environment['deployPhases']) {
      delete deployPhase['rank']
      delete deployPhase['refName']
      for (const workflowTask of deployPhase['workflowTasks']) {
        delete workflowTask['refName']
      }
    }
    if (environment['preDeployApprovals']['approvals']) {
      for (const approval of environment['preDeployApprovals']['approvals']) {
        delete approval['rank']
        delete approval['id']
        if (approval['approver']) {
          delete approval['approver']['displayName']
          delete approval['approver']['url']
          delete approval['approver']['_links']
          delete approval['approver']['uniqueName']
          delete approval['approver']['imageUrl']
          delete approval['approver']['descriptor']
        }
      }
    }
    if (environment['postDeployApprovals']['approvals']) {
      for (const approval of environment['postDeployApprovals']['approvals']) {
        delete approval['rank']
        delete approval['id']
        if (approval['approver']) {
          delete approval['approver']['displayName']
          delete approval['approver']['url']
          delete approval['approver']['_links']
          delete approval['approver']['uniqueName']
          delete approval['approver']['imageUrl']
          delete approval['approver']['descriptor']
        }
      }
    }
  }
  delete spec['_links']

  log.debug(`[removeFieldsFromReleaseDefinitionForExport] after[${JSON.stringify(definition)}]`)
  return definition
}

export { transformGetBuildDefinitionProcessResultForReporting, transformGetReleaseDefinitionProcessResultForReporting }

