import { Definition } from '@kroonprins/pipectl/dist/model'
import {
  AgentBasedDeployPhase,
  AgentDeploymentInput,
  ApprovalOptions,
  Artifact,
  ArtifactSourceReference,
  ConfigurationVariableValue,
  DeployPhase,
  DeployPhaseTypes,
  EnvironmentExecutionPolicy,
  EnvironmentOptions,
  EnvironmentRetentionPolicy,
  ReleaseDefinition,
  ReleaseDefinitionApprovals,
  ReleaseDefinitionApprovalStep,
  ReleaseDefinitionEnvironment,
  WorkflowTask,
} from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { isNumber } from 'util'
import { agentPoolApi } from '../../adapters/agent-pool-api'
import { buildApi } from '../../adapters/build-api'
import { coreApi } from '../../adapters/core-api'
import { taskDefinitionApi } from '../../adapters/task-definition-api'
import { taskGroupApi } from '../../adapters/task-group-api'
import { variableGroupApi } from '../../adapters/variable-group-api'
import { toTags } from '../../util/tags'
import { applyDefaults, enumValue } from './defaults'

const artifacts = async (
  releaseDefinition: ReleaseDefinition,
  _key: string,
  definition: Definition
): Promise<Artifact[]> => {
  return Promise.all(
    (releaseDefinition.artifacts || []).map((artifact) => {
      if (artifact.type === 'Build') {
        return applyDefaults(
          artifact,
          defaultsBuildArtifact,
          definition.metadata.namespace
        )
      } // TODO other artifact types?
      return applyDefaults(artifact, defaultsArtifact)
    })
  )
}

const definitionReference = async (
  artifact: Artifact,
  _key: string,
  projectId: string
): Promise<{ [key: string]: ArtifactSourceReference }> => {
  return applyDefaults(
    artifact.definitionReference || {},
    defaultsDefinitionReference,
    projectId
  )
}

const defaultVersionType = async (definitionRef: {
  [key: string]: ArtifactSourceReference
}): Promise<ArtifactSourceReference> => {
  return applyDefaults(
    definitionRef.defaultVersionType,
    defaultsDefaultVersionType
  )
}

const project = async (
  definitionRef: { [key: string]: ArtifactSourceReference },
  _key: string,
  projectId: string
): Promise<ArtifactSourceReference> => {
  if (!definitionRef.hasOwnProperty('project')) {
    return { id: await coreApi.findProjectIdByName(projectId) }
  } else if (
    !definitionRef.project.hasOwnProperty('id') ||
    !definitionRef.project.id
  ) {
    return {
      id: await coreApi.findProjectIdByName(
        definitionRef.project.name || projectId
      ),
    }
  }
  return definitionRef.project
}

const definitionReferenceDefinition = async (
  definitionRef: { [key: string]: ArtifactSourceReference },
  key: string,
  namespace: string
): Promise<ArtifactSourceReference> => {
  if (
    definitionRef.hasOwnProperty('definition') &&
    !definitionRef.definition.hasOwnProperty('id') &&
    definitionRef.definition.hasOwnProperty('name') &&
    definitionRef.definition.hasOwnProperty('path')
  ) {
    const buildName = definitionRef.definition.name!
    const buildPath = (definitionRef.definition as any).path
    const projectId = (await project(definitionRef, key, namespace)).id!
    const buildDefinition = await buildApi.findBuildDefinitionByNameAndPath(
      buildName,
      buildPath,
      projectId
    )
    if (buildDefinition) {
      return { id: buildDefinition.id!.toString() }
    }
  }
  return definitionRef.definition
}

const environments = async (
  releaseDefinition: ReleaseDefinition,
  _key: string,
  definition: Definition
): Promise<ReleaseDefinitionEnvironment[]> => {
  const projectId = definition.metadata.namespace
  return Promise.all(
    [
      ...(releaseDefinition.environments || []).entries(),
    ].map(([index, environment]) =>
      applyDefaults(environment, defaultsEnvironment, index, projectId)
    )
  )
}

const rank = async (_: any, _key: string, index: number): Promise<number> => {
  return index + 1
}

const environmentOptions = async (
  environment: ReleaseDefinitionEnvironment,
  _key: string,
  _index: number,
  projectId: string
): Promise<EnvironmentOptions> => {
  return applyDefaults(
    environment.environmentOptions || {},
    defaultsEnvironmentOptions,
    projectId
  )
}

const executionPolicy = async (
  environment: ReleaseDefinitionEnvironment
): Promise<EnvironmentExecutionPolicy> => {
  return applyDefaults(
    environment.executionPolicy || {},
    defaultsExecutionPolicy
  )
}

const retentionPolicy = async (
  environment: ReleaseDefinitionEnvironment
): Promise<EnvironmentRetentionPolicy> => {
  return applyDefaults(
    environment.retentionPolicy || {},
    defaultsRetentionPolicy
  )
}

const deployPhases = async (
  environment: ReleaseDefinitionEnvironment,
  _key: string,
  _index: number,
  projectId: string
): Promise<DeployPhase[]> => {
  return Promise.all(
    [...(environment.deployPhases || []).entries()].map(
      async ([index, deployPhase]) => {
        const commonDefaultsApplied = await applyDefaults(
          deployPhase,
          defaultsDeployPhase,
          index,
          projectId
        )
        if (
          commonDefaultsApplied.phaseType ===
          DeployPhaseTypes.AgentBasedDeployment
        ) {
          return applyDefaults(
            commonDefaultsApplied,
            defaultsAgentBasedDeployPhase,
            projectId
          )
        } // TODO other phase types?
        return commonDefaultsApplied
      }
    )
  )
}

const workflowTasks = async (
  deployPhase: DeployPhase,
  _key: string,
  _index: number,
  projectId: string
): Promise<WorkflowTask[]> => {
  return Promise.all(
    (deployPhase.workflowTasks || []).map(async (workflowTask) => {
      const defaultsApplied = await applyDefaults(
        workflowTask,
        defaultsWorkflowTask
      )
      if (
        !(defaultsApplied.hasOwnProperty('taskId') && defaultsApplied.taskId) &&
        defaultsApplied.hasOwnProperty('taskName') &&
        (defaultsApplied as any).taskName
      ) {
        if (defaultsApplied.definitionType === 'task') {
          defaultsApplied.taskId = await taskDefinitionApi.findTaskDefinitionIdByName(
            (defaultsApplied as any).taskName,
            defaultsApplied.version
          )
        } else if (defaultsApplied.definitionType === 'metaTask') {
          // metaTask = task group
          defaultsApplied.taskId = await taskGroupApi.findTaskGroupIdByName(
            (defaultsApplied as any).taskName,
            defaultsApplied.version,
            projectId
          )
        }
        delete (defaultsApplied as any).taskName
      }
      return defaultsApplied
    })
  )
}

const deploymentInput = async (
  deployPhase: AgentBasedDeployPhase,
  _key: string,
  projectId: string
): Promise<AgentDeploymentInput> => {
  return applyDefaults(
    deployPhase.deploymentInput || {},
    defaultsAgentDeploymentInput,
    projectId
  )
}

const queueId = async (
  agentDeploymentInput: AgentDeploymentInput,
  _key: string,
  projectId: string
): Promise<number | undefined> => {
  if (
    agentDeploymentInput.hasOwnProperty('queueId') &&
    agentDeploymentInput.queueId &&
    !isNumber(agentDeploymentInput.queueId)
  ) {
    return await agentPoolApi.findAgentPoolIdByName(
      agentDeploymentInput.queueId,
      projectId
    )
  }
  return agentDeploymentInput.queueId
}

const preDeployApprovals = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseDefinitionApprovals> => {
  if (
    !environment.hasOwnProperty('preDeployApprovals') ||
    !environment.preDeployApprovals ||
    !environment.preDeployApprovals.hasOwnProperty('approvals') ||
    !environment.preDeployApprovals.approvals ||
    !environment.preDeployApprovals.approvals.length
  ) {
    return defaultNoApproval
  } else {
    return applyDefaults(environment.preDeployApprovals, defaultsApproval)
  }
}

const postDeployApprovals = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseDefinitionApprovals> => {
  if (
    !environment.hasOwnProperty('postDeployApprovals') ||
    !environment.postDeployApprovals ||
    !environment.postDeployApprovals.hasOwnProperty('approvals') ||
    !environment.postDeployApprovals.approvals ||
    !environment.postDeployApprovals.approvals.length
  ) {
    return defaultNoApproval
  } else {
    return applyDefaults(environment.postDeployApprovals, defaultsApproval)
  }
}

const approvals = async (
  releaseDefinitionApprovals: ReleaseDefinitionApprovals
): Promise<ReleaseDefinitionApprovalStep[]> => {
  return Promise.all(
    [
      ...(releaseDefinitionApprovals.approvals || []).entries(),
    ].map(([index, approvalStep]) =>
      applyDefaults(approvalStep, defaultApprovalStep, index)
    )
  )
}

const approvalOptions = async (
  releaseDefinitionApprovals: ReleaseDefinitionApprovals
): Promise<ApprovalOptions> => {
  return applyDefaults(
    releaseDefinitionApprovals.approvalOptions || {},
    defaultsApprovalOptions
  )
}

const tags = (
  releaseDefinition: ReleaseDefinition,
  _key: string,
  definition: Definition
): string[] => {
  return (releaseDefinition.tags || []).concat(
    toTags(definition.metadata.labels)
  )
}

const variables = async (
  releaseDefinition: ReleaseDefinition,
  key: string
): Promise<{ [key: string]: ConfigurationVariableValue }> => {
  return _variables(releaseDefinition, key, { isDefault: true })
}

const variablesScoped = async (
  environment: ReleaseDefinitionEnvironment,
  key: string,
  index: number
): Promise<{ [key: string]: ConfigurationVariableValue }> => {
  return _variables(environment, key, {
    key: await rank(undefined, key, index),
  })
}

const _variables = async (
  source: ReleaseDefinition | ReleaseDefinitionEnvironment,
  _key: string,
  scope: { [key: string]: any }
): Promise<{ [key: string]: ConfigurationVariableValue }> => {
  return Object.entries(source.variables || {})
    .map(([variable, value]) => {
      if (value && value.hasOwnProperty('value')) {
        return { [variable]: Object.assign({}, value, { scope }) }
      } else {
        return { [variable]: { value: value as string, scope } }
      }
    })
    .reduce(
      (previousValue, currentValue) =>
        Object.assign({}, previousValue, currentValue),
      {}
    )
}

const variableGroups = async (
  releaseDefinition: ReleaseDefinition,
  key: string,
  definition: Definition
): Promise<number[]> => {
  return _variableGroups(releaseDefinition, key, definition.metadata.namespace)
}

const variableGroupsScoped = async (
  environment: ReleaseDefinitionEnvironment,
  key: string,
  _index: number,
  projectId: string
): Promise<number[]> => {
  return _variableGroups(environment, key, projectId)
}

const _variableGroups = async (
  source: ReleaseDefinition | ReleaseDefinitionEnvironment,
  _key: string,
  projectId: string
): Promise<number[]> => {
  return Promise.all(
    (source.variableGroups || []).map(async (variableGroup) => {
      if (!isNumber(variableGroup)) {
        return await variableGroupApi.findVariableGroupIdByName(
          variableGroup,
          projectId
        )
      }
      return variableGroup
    })
  )
}

const defaultsReleaseDefinition: ReleaseDefinition | object = {
  artifacts,
  environments,
  path: '\\',
  tags,
  variableGroups,
  variables,
}

const defaultsArtifact: Artifact = {}

const defaultsBuildArtifact: Artifact | object = {
  definitionReference,
}

const defaultsDefinitionReference:
  | { [key: string]: ArtifactSourceReference }
  | object = {
  defaultVersionType,
  project,
  definition: definitionReferenceDefinition,
}

const defaultsDefaultVersionType: ArtifactSourceReference = {
  id: 'latestType',
  name: 'Latest',
}

const defaultsEnvironment: ReleaseDefinitionEnvironment | object = {
  rank,
  environmentOptions,
  executionPolicy,
  retentionPolicy,
  deployPhases,
  preDeployApprovals,
  postDeployApprovals,
  variableGroups: variableGroupsScoped,
  variables: variablesScoped,
}

const defaultsEnvironmentOptions: EnvironmentOptions = {
  emailNotificationType: 'Always',
  publishDeploymentStatus: true,
}

const defaultsExecutionPolicy: EnvironmentExecutionPolicy = {
  concurrencyCount: 1,
  queueDepthCount: 0,
}

const defaultsRetentionPolicy: EnvironmentRetentionPolicy = {
  daysToKeep: 30,
  releasesToKeep: 3,
  retainBuild: true,
}

const defaultsDeployPhase: DeployPhase | object = {
  rank,
  phaseType: enumValue(DeployPhaseTypes, DeployPhaseTypes.AgentBasedDeployment),
  workflowTasks,
}

const defaultsWorkflowTask: WorkflowTask | object = {
  enabled: true,
  alwaysRun: false,
  continueOnError: false,
  timeoutInMinutes: 0,
  definitionType: 'task',
  version: '1.*',
}

const defaultsAgentBasedDeployPhase: AgentBasedDeployPhase | object = {
  deploymentInput,
}

const defaultsAgentDeploymentInput: AgentDeploymentInput | object = {
  queueId,
}

const defaultNoApproval: ReleaseDefinitionApprovals = {
  approvals: [
    {
      rank: 1,
      isAutomated: true,
      isNotificationOn: false,
    },
  ],
  approvalOptions: {
    releaseCreatorCanBeApprover: false,
  },
}

const defaultsApproval: ReleaseDefinitionApprovals | object = {
  approvals,
  approvalOptions,
}

const defaultApprovalStep: ReleaseDefinitionApprovalStep | object = {
  rank,
  isAutomated: false,
  isNotificationOn: false,
}

const defaultsApprovalOptions: ApprovalOptions = {
  releaseCreatorCanBeApprover: false,
  autoTriggeredAndPreviousEnvironmentApprovedCanBeSkipped: false,
  enforceIdentityRevalidation: false,
  timeoutInMinutes: 0,
  executionOrder: 1,
}

export { defaultsReleaseDefinition }
