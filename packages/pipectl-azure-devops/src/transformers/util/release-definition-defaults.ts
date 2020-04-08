import { AgentBasedDeployPhase, AgentDeploymentInput, ApprovalOptions, Artifact, ArtifactSourceReference, DeployPhase, DeployPhaseTypes, EnvironmentExecutionPolicy, EnvironmentOptions, EnvironmentRetentionPolicy, ReleaseDefinition, ReleaseDefinitionApprovals, ReleaseDefinitionApprovalStep, ReleaseDefinitionEnvironment, WorkflowTask } from "azure-devops-node-api/interfaces/ReleaseInterfaces"
import { Definition } from "pipectl-core/dist/model"
import { isNumber } from "util"
import { agentPoolApi } from "../../adapters/agent-pool-api"
import { buildApi } from "../../adapters/build-api"
import { coreApi } from "../../adapters/core-api"
import { variableGroupApi } from "../../adapters/variable-group-api"
import { applyDefaults } from "./defaults"

const artifacts = async (spec: ReleaseDefinition, definition: Definition): Promise<Artifact[]> => {
  return Promise.all(
    (spec.artifacts || [])
      .map(artifact => {
        if (artifact.type === 'Build') {
          return applyDefaults(artifact, defaultsBuildArtifact, definition.metadata.namespace)
        } // TODO other artifact types?
        return applyDefaults(artifact, defaultsArtifact)
      })
  )
}

const definitionReference = async (artifact: Artifact, project: string): Promise<{ [key: string]: ArtifactSourceReference }> => {
  return applyDefaults(artifact.definitionReference || {}, defaultsDefinitionReference, project)
}

const defaultVersionType = async (definitionReference: { [key: string]: ArtifactSourceReference }): Promise<ArtifactSourceReference> => {
  return applyDefaults(definitionReference.defaultVersionType, defaultsDefaultVersionType)
}

const project = async (definitionReference: { [key: string]: ArtifactSourceReference }, project: string): Promise<ArtifactSourceReference> => {
  if (!definitionReference.hasOwnProperty('project')) {
    return { id: await coreApi.findProjectIdByName(project) }
  } else if (!definitionReference.project.hasOwnProperty('id') || !definitionReference.project.id) {
    return { id: await coreApi.findProjectIdByName(definitionReference.project.name || project) }
  }
  return definitionReference.project
}

const definition = async (definitionReference: { [key: string]: ArtifactSourceReference }, namespace: string): Promise<ArtifactSourceReference> => {
  if (definitionReference.hasOwnProperty('definition')
    && !definitionReference.definition.hasOwnProperty('id')
    && definitionReference.definition.hasOwnProperty('name')
    && definitionReference.definition.hasOwnProperty('path')) {
    const buildName = definitionReference.definition.name!
    const buildPath = (definitionReference.definition as any).path
    const projectId = (await project(definitionReference, namespace)).id!
    const buildDefinition = await buildApi.findBuildDefinitionByNameAndPath(buildName, buildPath, projectId)
    if (buildDefinition) {
      return { id: buildDefinition.id!.toString() }
    }
  }
  return definitionReference.definition
}

const environments = async (spec: ReleaseDefinition, definition: Definition): Promise<ReleaseDefinitionEnvironment[]> => {
  const project = definition.metadata.namespace
  return Promise.all(
    [...(spec.environments || []).entries()]
      .map(([index, environment]) => applyDefaults(environment, defaultsEnvironment, index, project))
  )
}

const rank = async (_: any, index: number): Promise<number> => {
  return index + 1
}

const environmentOptions = async (environment: ReleaseDefinitionEnvironment, _index: number, project: string): Promise<EnvironmentOptions> => {
  return applyDefaults(environment.environmentOptions || {}, defaultsEnvironmentOptions, project)
}

const executionPolicy = async (environment: ReleaseDefinitionEnvironment): Promise<EnvironmentExecutionPolicy> => {
  return applyDefaults(environment.executionPolicy || {}, defaultsExecutionPolicy)
}

const retentionPolicy = async (environment: ReleaseDefinitionEnvironment): Promise<EnvironmentRetentionPolicy> => {
  return applyDefaults(environment.retentionPolicy || {}, defaultsRetentionPolicy)
}

const deployPhases = async (environment: ReleaseDefinitionEnvironment, _index: number, project: string): Promise<DeployPhase[]> => {
  return Promise.all(
    [...(environment.deployPhases || []).entries()]
      .map(async ([index, deployPhase]) => {
        const commonDefaultsApplied = await applyDefaults(deployPhase, defaultsDeployPhase, index)
        if (commonDefaultsApplied.phaseType === DeployPhaseTypes.AgentBasedDeployment) {
          return applyDefaults(commonDefaultsApplied, defaultsAgentBasedDeployPhase, project)
        } //TODO other phase types?
        return commonDefaultsApplied
      })
  )
}

const workflowTasks = async (deployPhase: DeployPhase): Promise<WorkflowTask[]> => {
  return Promise.all(
    (deployPhase.workflowTasks || [])
      .map(workflowTask => applyDefaults(workflowTask, defaultsWorkflowTask))
  )
}

const deploymentInput = async (deployPhase: AgentBasedDeployPhase, project: string): Promise<AgentDeploymentInput> => {
  return applyDefaults(deployPhase.deploymentInput || {}, defaultsAgentDeploymentInput, project)
}

const queueId = async (agentDeploymentInput: AgentDeploymentInput, project: string): Promise<number | undefined> => {
  if (agentDeploymentInput.hasOwnProperty('queueId') && agentDeploymentInput.queueId && !isNumber(agentDeploymentInput.queueId)) {
    return await agentPoolApi.findAgentPoolIdByName(agentDeploymentInput.queueId, project)
  }
  return agentDeploymentInput.queueId
}

const preDeployApprovals = async (environment: ReleaseDefinitionEnvironment): Promise<ReleaseDefinitionApprovals> => {
  if (!environment.hasOwnProperty('preDeployApprovals')
    || !environment.preDeployApprovals
    || !environment.preDeployApprovals.hasOwnProperty('approvals')
    || !environment.preDeployApprovals.approvals
    || !environment.preDeployApprovals.approvals.length) {
    return defaultNoApproval
  } else {
    return applyDefaults(environment.preDeployApprovals, defaultsApproval)
  }
}

const postDeployApprovals = async (environment: ReleaseDefinitionEnvironment): Promise<ReleaseDefinitionApprovals> => {
  if (!environment.hasOwnProperty('postDeployApprovals')
    || !environment.postDeployApprovals
    || !environment.postDeployApprovals.hasOwnProperty('approvals')
    || !environment.postDeployApprovals.approvals
    || !environment.postDeployApprovals.approvals.length) {
    return defaultNoApproval
  } else {
    return applyDefaults(environment.postDeployApprovals, defaultsApproval)
  }
}

const approvals = async (approvals: ReleaseDefinitionApprovals): Promise<ReleaseDefinitionApprovalStep[]> => {
  return Promise.all(
    [...(approvals.approvals || []).entries()]
      .map(([index, approvalStep]) => applyDefaults(approvalStep, defaultApprovalStep, index))
  )
}

const approvalOptions = async (approvals: ReleaseDefinitionApprovals): Promise<ApprovalOptions> => {
  return applyDefaults(approvals.approvalOptions || {}, defaultsApprovalOptions)
}

const variableGroups = async (environment: ReleaseDefinitionEnvironment, project: string): Promise<number[]> => {
  const variableGroups = environment.variableGroups || []
  if (environment.hasOwnProperty('variableGroups') && environment.variableGroups && environment.variableGroups.length) {
    for (let variableGroup of environment.variableGroups) {
      if (!isNumber(variableGroup)) {
        variableGroup = await variableGroupApi.findVariableGroupIdByName(variableGroup, project)
      }
      variableGroups.push(variableGroup)
    }
  }
  return variableGroups
}

const defaultsReleaseDefinition: ReleaseDefinition | object = {
  artifacts,
  environments,
}

const defaultsArtifact: Artifact = {}

const defaultsBuildArtifact: Artifact | object = {
  definitionReference,
}

const defaultsDefinitionReference: { [key: string]: ArtifactSourceReference } | object = {
  defaultVersionType,
  project,
  definition,
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
  variableGroups,
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
  phaseType: DeployPhaseTypes.AgentBasedDeployment,
  workflowTasks,
}

const defaultsWorkflowTask: WorkflowTask | object = {
  enabled: true
}

const defaultsAgentBasedDeployPhase: AgentBasedDeployPhase | object = {
  deploymentInput,
}

const defaultsAgentDeploymentInput: AgentDeploymentInput | object = {
  queueId,
}

const defaultNoApproval: ReleaseDefinitionApprovals = {
  approvals: [{
    rank: 1,
    isAutomated: true,
    isNotificationOn: false
  }],
  approvalOptions: {
    releaseCreatorCanBeApprover: false
  }
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
}

export { defaultsReleaseDefinition }

