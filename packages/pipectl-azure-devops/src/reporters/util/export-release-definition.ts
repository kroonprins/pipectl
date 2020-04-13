import {
  AgentBasedDeployPhase,
  AgentDeploymentInput,
  ApprovalOptions,
  Artifact,
  ArtifactDownloadInputBase,
  ArtifactsDownloadInput,
  ArtifactSourceReference,
  Condition,
  ConfigurationVariableValue,
  Demand,
  DeployPhase,
  DeployPhaseTypes,
  EnvironmentExecutionPolicy,
  EnvironmentOptions,
  EnvironmentRetentionPolicy,
  EnvironmentTrigger,
  ExecutionInput,
  ReleaseDefinition,
  ReleaseDefinitionApprovals,
  ReleaseDefinitionApprovalStep,
  ReleaseDefinitionEnvironment,
  ReleaseDefinitionGate,
  ReleaseDefinitionGatesStep,
  ReleaseSchedule,
  ReleaseTriggerBase,
  WorkflowTask,
} from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { agentPoolApi } from '../../adapters/agent-pool-api'
import { buildApi } from '../../adapters/build-api'
import { variableGroupApi } from '../../adapters/variable-group-api'
import { applyExport, filterProp } from './export'

const artifacts = async (
  releaseDefinition: ReleaseDefinition
): Promise<Artifact[] | undefined> => {
  return Promise.all(
    (releaseDefinition.artifacts || []).map((artifact) => {
      if (artifact.type === 'Build') {
        return applyExport(artifact, exportBuildArtifact)
      } // TODO other artifact types?
      return applyExport(artifact, exportArtifact)
    })
  )
}

const definitionReference = async (
  artifact: Artifact
): Promise<ArtifactSourceReference | undefined> => {
  return applyExport(
    artifact.definitionReference || {},
    exportArtifactSourceReference,
    artifact.definitionReference?.project.id
  )
}

const defaultVersionType = async (definitionRef: {
  [key: string]: ArtifactSourceReference
}): Promise<ArtifactSourceReference | undefined> => {
  const exported = applyExport(
    definitionRef.defaultVersionType || {},
    exportDefaultVersionType
  )
  return Object.keys(exported).length !== 0 ? exported : undefined
}

const definitionReferenceDefinition = async (
  definitionRef: { [key: string]: ArtifactSourceReference },
  projectId: string
): Promise<{ [key: string]: string }> => {
  const buildDefinition = await buildApi.findBuildDefinitionById(
    Number(definitionRef.definition.id),
    projectId
  )
  return { name: buildDefinition.name!, path: buildDefinition.path! }
}

const description = async (
  releaseDefinition: ReleaseDefinition
): Promise<string | undefined> => {
  return releaseDefinition.description
    ? releaseDefinition.description
    : undefined
}

const environments = async (
  releaseDefinition: ReleaseDefinition,
  projectId: string
): Promise<ReleaseDefinitionEnvironment[] | undefined> => {
  return Promise.all(
    (releaseDefinition.environments || []).map((environment) =>
      applyExport(environment, exportEnvironment, projectId)
    )
  )
}

const properties = async (
  releaseDefinition: ReleaseDefinition | ReleaseDefinitionEnvironment
): Promise<any> => {
  return Object.keys(releaseDefinition.properties).length !== 0
    ? releaseDefinition.properties
    : undefined
}

const conditions = async (
  environment: ReleaseDefinitionEnvironment
): Promise<Condition[] | undefined> => {
  return (environment.conditions || []).length !== 0
    ? environment.conditions
    : undefined
}

const demands = async (
  environment: ReleaseDefinitionEnvironment | AgentDeploymentInput
): Promise<Demand[] | undefined> => {
  return (environment.demands || []).length !== 0
    ? environment.demands
    : undefined
}

const deployPhases = async (
  environment: ReleaseDefinitionEnvironment,
  projectId: string
): Promise<DeployPhase[] | undefined> => {
  const exported = await Promise.all(
    (environment.deployPhases || []).map(async (deployPhase) => {
      const exportedDeployPhase = await applyExport(
        deployPhase,
        exportDeployPhase
      )
      if (deployPhase.phaseType === DeployPhaseTypes.AgentBasedDeployment) {
        return applyExport(
          exportedDeployPhase,
          exportAgentBasedDeployPhase,
          projectId
        )
      }
      return exportedDeployPhase
    })
  )
  return exported.length !== 0 ? exported : undefined
}

const environmentOptions = async (
  environment: ReleaseDefinitionEnvironment
): Promise<EnvironmentOptions | undefined> => {
  const exported = await applyExport(
    environment.environmentOptions || {},
    exportEnvironmentOptions
  )
  return Object.keys(exported).length !== 0 ? exported : undefined
}

const environmentTriggers = async (
  environment: ReleaseDefinitionEnvironment
): Promise<EnvironmentTrigger[] | undefined> => {
  return (environment.environmentTriggers || []).length !== 0
    ? environment.environmentTriggers
    : undefined
}

const executionPolicy = async (
  environment: ReleaseDefinitionEnvironment
): Promise<EnvironmentExecutionPolicy | undefined> => {
  const exported = await applyExport(
    environment.executionPolicy || {},
    exportExecutionPolicy
  )
  return Object.keys(exported).length !== 0 ? exported : undefined
}

const workflowTasks = async (
  deployPhase: DeployPhase
): Promise<WorkflowTask[] | undefined> => {
  const exported = (
    await Promise.all(
      (deployPhase.workflowTasks || []).map((workflowTask) => {
        return applyExport(workflowTask || {}, exportWorkflowTask)
      })
    )
  ).filter(
    (workflowTask) => workflowTask && Object.keys(workflowTask).length !== 0
  )
  return exported.length !== 0 ? exported : undefined
}

const deploymentInput = async (
  deployPhase: AgentBasedDeployPhase,
  projectId: string
): Promise<AgentDeploymentInput | undefined> => {
  const exported = await applyExport(
    deployPhase.deploymentInput || {},
    exportAgentDeploymentInput,
    projectId
  )
  return Object.keys(exported).length !== 0 ? exported : undefined
}

const queueId = async (
  agentDeploymentInput: AgentDeploymentInput,
  projectId: string
): Promise<string | number | undefined> => {
  const queueName = await agentPoolApi.findAgentPoolNameById(
    agentDeploymentInput.queueId!,
    projectId
  )
  return queueName || agentDeploymentInput.queueId
}

const agentDeploymentInputParallelExecution = async (
  agentDeploymentInput: AgentDeploymentInput
): Promise<ExecutionInput | undefined> => {
  const exported = await applyExport(
    agentDeploymentInput.parallelExecution || {},
    exportAgentDeploymentInputParallelExecution
  )
  return Object.keys(exported).length !== 0 ? exported : undefined
}

const agentDeploymentInputArtifactsDownloadInput = async (
  agentDeploymentInput: AgentDeploymentInput
): Promise<ArtifactsDownloadInput | undefined> => {
  const exported = await applyExport(
    agentDeploymentInput.artifactsDownloadInput || {},
    exportAgentDeploymentInputArtifactsDownloadInput
  )
  return Object.keys(exported).length !== 0 ? exported : undefined
}

const agentDeploymentInputArtifactsDownloadInputs = async (
  artifactsDownloadInput: ArtifactsDownloadInput
): Promise<ArtifactDownloadInputBase[] | undefined> => {
  return (artifactsDownloadInput.downloadInputs || []).length !== 0
    ? artifactsDownloadInput.downloadInputs
    : undefined
}

const preDeployApprovals = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseDefinitionApprovals | undefined> => {
  const deployApprovals = await applyExport(
    environment.preDeployApprovals || {},
    exportReleaseDefinitionApprovals
  )
  return Object.keys(deployApprovals).length !== 0 ? deployApprovals : undefined
}

const preDeploymentGates = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseDefinitionGatesStep | undefined> => {
  const deploymentGates = await applyExport(
    environment.preDeploymentGates || {},
    exportDeploymentGates
  )
  return Object.keys(deploymentGates).length !== 0 ? deploymentGates : undefined
}

const gates = async (
  releaseDefinitionGatesStep: ReleaseDefinitionGatesStep
): Promise<ReleaseDefinitionGate[] | undefined> => {
  return (releaseDefinitionGatesStep.gates || []).length !== 0
    ? releaseDefinitionGatesStep.gates
    : undefined
}

const postDeployApprovals = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseDefinitionApprovals | undefined> => {
  const deployApprovals = await applyExport(
    environment.postDeployApprovals || {},
    exportReleaseDefinitionApprovals
  )
  return Object.keys(deployApprovals).length !== 0 ? deployApprovals : undefined
}

const postDeploymentGates = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseDefinitionGatesStep | undefined> => {
  const deploymentGates = await applyExport(
    environment.postDeploymentGates || {},
    exportDeploymentGates
  )
  return Object.keys(deploymentGates).length !== 0 ? deploymentGates : undefined
}

const approvals = async (
  releaseDefinitionApprovals: ReleaseDefinitionApprovals
): Promise<ReleaseDefinitionApprovalStep[] | undefined> => {
  const exported = (
    await Promise.all(
      (releaseDefinitionApprovals.approvals || []).map(
        async (releaseDefinitionApproval) => {
          return applyExport(releaseDefinitionApproval, exportApproval)
        }
      )
    )
  ).filter(
    (releaseDefinitionApproval) =>
      releaseDefinitionApproval &&
      Object.keys(releaseDefinitionApproval).length !== 0
  )
  return exported.length !== 0 ? exported : undefined
}

const approvalOptions = async (
  releaseDefinitionApprovals: ReleaseDefinitionApprovals
): Promise<ApprovalOptions | undefined> => {
  const exported = await applyExport(
    releaseDefinitionApprovals.approvalOptions || {},
    exportApprovalOptions
  )
  return Object.keys(exported).length !== 0 ? exported : undefined
}

const tags = async (
  releaseDefinition: ReleaseDefinition
): Promise<string[] | undefined> => {
  return (releaseDefinition.tags || []).length !== 0
    ? releaseDefinition.tags
    : undefined
}

const triggers = async (
  releaseDefinition: ReleaseDefinition
): Promise<ReleaseTriggerBase[] | undefined> => {
  return (releaseDefinition.triggers || []).length !== 0
    ? releaseDefinition.triggers
    : undefined
}

const variableGroups = async (
  releaseDefinition: ReleaseDefinition | ReleaseDefinitionEnvironment,
  projectId: string
): Promise<string[] | undefined> => {
  const vars = await Promise.all(
    (releaseDefinition.variableGroups || []).map(async (variable) => {
      const variableGroup = await variableGroupApi.findVariableGroupById(
        variable,
        projectId
      )
      return variableGroup.name!
    })
  )
  return vars.length !== 0 ? vars : undefined
}

const retentionPolicy = async (
  environment: ReleaseDefinitionEnvironment
): Promise<EnvironmentRetentionPolicy | undefined> => {
  const exported = await applyExport(
    environment.retentionPolicy || {},
    exportRetentionPolicy
  )
  return Object.keys(exported).length !== 0 ? exported : undefined
}

const schedules = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseSchedule[] | undefined> => {
  return (environment.schedules || []).length !== 0
    ? environment.schedules
    : undefined
}

const variables = async (
  releaseDefinition: ReleaseDefinition | ReleaseDefinitionEnvironment
): Promise<
  | { [key: string]: ConfigurationVariableValue }
  | { [key: string]: string | undefined }
  | undefined
> => {
  const vars = (
    await Promise.all(
      Object.entries(releaseDefinition.variables || {}).map(
        async ([name, value]) => {
          const exported = await applyExport(value, exportVariable)
          if (
            Object.keys(exported).length === 1 &&
            exported.hasOwnProperty('value')
          ) {
            return { [name]: value.value }
          }
          return { [name]: value }
        }
      )
    )
  ).reduce(
    (previousValue, currentValue) =>
      Object.assign({}, previousValue, currentValue),
    {}
  )
  return vars.length !== 0 ? vars : undefined
}

const exportReleaseDefinition: ReleaseDefinition | object = {
  _links: filterProp,
  artifacts,
  createdBy: filterProp,
  createdOn: filterProp,
  description,
  environments,
  id: filterProp,
  isDeleted: filterProp,
  modifiedBy: filterProp,
  modifiedOn: filterProp,
  path: '\\',
  projectReference: filterProp,
  properties,
  releaseNameFormat: '',
  revision: filterProp,
  source: filterProp,
  tags,
  triggers,
  url: filterProp,
  variables,
  variableGroups,
}

const exportArtifact: Artifact = {}

const exportBuildArtifact: Artifact | object = {
  sourceId: filterProp,
  definitionReference,
  isPrimary: false,
  isRetained: false,
}

const exportArtifactSourceReference: ArtifactSourceReference | object = {
  artifactSourceDefinitionUrl: filterProp,
  defaultVersionType,
  definition: definitionReferenceDefinition,
  project: filterProp,
}

const exportDefaultVersionType: ArtifactSourceReference = {
  id: 'latestType',
  name: 'Latest',
}

const exportEnvironment: ReleaseDefinitionEnvironment | object = {
  badgeUrl: filterProp,
  conditions,
  currentRelease: filterProp,
  demands,
  deployPhases,
  deployStep: filterProp,
  environmentOptions,
  environmentTriggers,
  executionPolicy,
  id: filterProp,
  owner: filterProp,
  preDeployApprovals,
  preDeploymentGates,
  properties,
  postDeployApprovals,
  postDeploymentGates,
  rank: filterProp,
  retentionPolicy,
  schedules,
  variables,
  variableGroups,
}

const exportReleaseDefinitionApprovals: ReleaseDefinitionApprovals | object = {
  approvals,
  approvalOptions,
}

const exportApproval: ReleaseDefinitionApprovalStep | object = {
  rank: filterProp,
  isAutomated: true,
  isNotificationOn: false,
  id: filterProp,
}

const exportApprovalOptions: ApprovalOptions | object = {
  requiredApproverCount: null, // seems bug in API that this comes back as null
  releaseCreatorCanBeApprover: false,
  autoTriggeredAndPreviousEnvironmentApprovedCanBeSkipped: false,
  enforceIdentityRevalidation: false,
  timeoutInMinutes: 0,
  executionOrder: 1,
}

const exportDeploymentGates: ReleaseDefinitionGatesStep | object = {
  id: filterProp,
  gatesOptions: null,
  gates,
}

const exportRetentionPolicy: EnvironmentRetentionPolicy = {
  daysToKeep: 30,
  releasesToKeep: 3,
  retainBuild: true,
}

const exportDeployPhase: DeployPhase | object = {
  rank: filterProp,
  phaseType: DeployPhaseTypes.AgentBasedDeployment,
  refName: filterProp,
  workflowTasks,
}

const exportAgentBasedDeployPhase: AgentBasedDeployPhase | object = {
  deploymentInput,
}

const exportAgentDeploymentInput: AgentDeploymentInput | object = {
  skipArtifactsDownload: false,
  enableAccessToken: false,
  timeoutInMinutes: 0,
  jobCancelTimeoutInMinutes: 1,
  condition: 'succeeded()',
  overrideInputs: filterProp, // TODO
  queueId,
  demands,
  parallelExecution: agentDeploymentInputParallelExecution,
  artifactsDownloadInput: agentDeploymentInputArtifactsDownloadInput,
}

const exportAgentDeploymentInputParallelExecution: ExecutionInput | object = {
  parallelExecutionType: 'none', // ParallelExecutionTypes.None, bug in API that it comes back as a string
}

const exportAgentDeploymentInputArtifactsDownloadInput:
  | ArtifactsDownloadInput
  | object = {
  downloadInputs: agentDeploymentInputArtifactsDownloadInputs,
}

const exportEnvironmentOptions: EnvironmentOptions = {
  emailNotificationType: 'Always',
  emailRecipients: 'release.environment.owner;release.creator',
  skipArtifactsDownload: false,
  timeoutInMinutes: 0,
  enableAccessToken: false,
  publishDeploymentStatus: true,
  badgeEnabled: false,
  autoLinkWorkItems: false,
  pullRequestDeploymentEnabled: false,
}

const exportExecutionPolicy: EnvironmentExecutionPolicy = {
  concurrencyCount: 1,
  queueDepthCount: 0,
}

const exportWorkflowTask: WorkflowTask | object = {
  enabled: true,
  environment: filterProp, // TODO
  refName: filterProp,
  alwaysRun: false,
  continueOnError: false,
  timeoutInMinutes: 0,
  overrideInputs: filterProp, // TODO
}

const exportVariable: ConfigurationVariableValue = {
  allowOverride: false,
  isSecret: false,
}

export { exportReleaseDefinition }
