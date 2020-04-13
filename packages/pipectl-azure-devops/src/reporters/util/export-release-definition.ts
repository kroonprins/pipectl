import {
  AgentBasedDeployPhase,
  AgentDeploymentInput,
  ApprovalOptions,
  Artifact,
  ArtifactsDownloadInput,
  ArtifactSourceReference,
  ConfigurationVariableValue,
  DeployPhase,
  DeployPhaseTypes,
  EnvironmentExecutionPolicy,
  EnvironmentOptions,
  EnvironmentRetentionPolicy,
  ExecutionInput,
  ReleaseDefinition,
  ReleaseDefinitionApprovals,
  ReleaseDefinitionApprovalStep,
  ReleaseDefinitionEnvironment,
  ReleaseDefinitionGatesStep,
  WorkflowTask,
} from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { agentPoolApi } from '../../adapters/agent-pool-api'
import { buildApi } from '../../adapters/build-api'
import { variableGroupApi } from '../../adapters/variable-group-api'
import {
  applyExport,
  applyExportOnArray,
  filterIfEmpty,
  filterProp,
} from './export'

const artifacts = async (
  releaseDefinition: ReleaseDefinition
): Promise<Artifact[]> =>
  Promise.all(
    (releaseDefinition.artifacts || []).map((artifact) => {
      if (artifact.type === 'Build') {
        return applyExport(artifact, exportBuildArtifact)
      } // TODO other artifact types?
      return applyExport(artifact, exportArtifact)
    })
  )

const definitionReference = async (
  artifact: Artifact
): Promise<ArtifactSourceReference> =>
  applyExport(
    artifact.definitionReference,
    exportArtifactSourceReference,
    artifact.definitionReference?.project.id
  )

const defaultVersionType = async (definitionRef: {
  [key: string]: ArtifactSourceReference
}): Promise<ArtifactSourceReference> =>
  applyExport(definitionRef.defaultVersionType, exportDefaultVersionType)

const definitionReferenceDefinition = async (
  definitionRef: { [key: string]: ArtifactSourceReference },
  _key: string,
  projectId: string
): Promise<{ [key: string]: string }> => {
  const buildDefinition = await buildApi.findBuildDefinitionById(
    Number(definitionRef.definition.id),
    projectId
  )
  return { name: buildDefinition.name!, path: buildDefinition.path! }
}

const environments = async (
  releaseDefinition: ReleaseDefinition,
  _key: string,
  projectId: string
): Promise<ReleaseDefinitionEnvironment[]> =>
  Promise.all(
    (releaseDefinition.environments || []).map((environment) =>
      applyExport(environment, exportEnvironment, projectId)
    )
  )
const deployPhases = async (
  environment: ReleaseDefinitionEnvironment,
  _key: string,
  projectId: string
): Promise<DeployPhase[]> =>
  Promise.all(
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

const environmentOptions = async (
  environment: ReleaseDefinitionEnvironment
): Promise<EnvironmentOptions> =>
  applyExport(environment.environmentOptions, exportEnvironmentOptions)

const executionPolicy = async (
  environment: ReleaseDefinitionEnvironment
): Promise<EnvironmentExecutionPolicy | undefined> =>
  applyExport(environment.executionPolicy, exportExecutionPolicy)

const workflowTasks = async (
  deployPhase: DeployPhase
): Promise<WorkflowTask[]> =>
  Promise.all(
    (deployPhase.workflowTasks || []).map((workflowTask) => {
      return applyExport(workflowTask, exportWorkflowTask)
    })
  )

const deploymentInput = async (
  deployPhase: AgentBasedDeployPhase,
  _key: string,
  projectId: string
): Promise<AgentDeploymentInput> =>
  applyExport(
    deployPhase.deploymentInput,
    exportAgentDeploymentInput,
    projectId
  )

const queueId = async (
  agentDeploymentInput: AgentDeploymentInput,
  _key: string,
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
): Promise<ExecutionInput> =>
  applyExport(
    agentDeploymentInput.parallelExecution,
    exportAgentDeploymentInputParallelExecution
  )

const agentDeploymentInputArtifactsDownloadInput = async (
  agentDeploymentInput: AgentDeploymentInput
): Promise<ArtifactsDownloadInput> =>
  applyExport(
    agentDeploymentInput.artifactsDownloadInput,
    exportAgentDeploymentInputArtifactsDownloadInput
  )

const preDeployApprovals = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseDefinitionApprovals> =>
  applyExport(environment.preDeployApprovals, exportReleaseDefinitionApprovals)

const preDeploymentGates = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseDefinitionGatesStep> =>
  applyExport(environment.preDeploymentGates, exportDeploymentGates)

const postDeployApprovals = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseDefinitionApprovals> =>
  applyExport(environment.postDeployApprovals, exportReleaseDefinitionApprovals)

const postDeploymentGates = async (
  environment: ReleaseDefinitionEnvironment
): Promise<ReleaseDefinitionGatesStep> =>
  applyExport(environment.postDeploymentGates, exportDeploymentGates)

const approvals = async (
  releaseDefinitionApprovals: ReleaseDefinitionApprovals
): Promise<ReleaseDefinitionApprovalStep[]> =>
  applyExportOnArray(releaseDefinitionApprovals.approvals, exportApproval)

const approvalOptions = async (
  releaseDefinitionApprovals: ReleaseDefinitionApprovals
): Promise<ApprovalOptions> =>
  applyExport(releaseDefinitionApprovals.approvalOptions, exportApprovalOptions)

const variableGroups = async (
  releaseDefinition: ReleaseDefinition | ReleaseDefinitionEnvironment,
  _key: string,
  projectId: string
): Promise<string[]> =>
  Promise.all(
    (releaseDefinition.variableGroups || []).map(async (variable) => {
      const variableGroup = await variableGroupApi.findVariableGroupById(
        variable,
        projectId
      )
      return variableGroup.name!
    })
  )

const retentionPolicy = async (
  environment: ReleaseDefinitionEnvironment
): Promise<EnvironmentRetentionPolicy> =>
  applyExport(environment.retentionPolicy, exportRetentionPolicy)

const variables = async (
  releaseDefinition: ReleaseDefinition | ReleaseDefinitionEnvironment
): Promise<
  | { [key: string]: ConfigurationVariableValue }
  | { [key: string]: string | undefined }
> =>
  (
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

const exportReleaseDefinition: ReleaseDefinition | object = {
  _links: filterProp,
  artifacts,
  createdBy: filterProp,
  createdOn: filterProp,
  description: filterIfEmpty,
  environments,
  id: filterProp,
  isDeleted: filterProp,
  modifiedBy: filterProp,
  modifiedOn: filterProp,
  path: '\\',
  projectReference: filterProp,
  properties: filterIfEmpty,
  releaseNameFormat: '',
  revision: filterProp,
  source: filterProp,
  tags: filterIfEmpty,
  triggers: filterIfEmpty,
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
  conditions: filterIfEmpty,
  currentRelease: filterProp,
  demands: filterIfEmpty,
  deployPhases,
  deployStep: filterProp,
  environmentOptions,
  environmentTriggers: executionPolicy,
  executionPolicy,
  id: filterProp,
  owner: filterProp,
  preDeployApprovals,
  preDeploymentGates,
  properties: filterIfEmpty,
  postDeployApprovals,
  postDeploymentGates,
  rank: filterProp,
  retentionPolicy,
  schedules: filterIfEmpty,
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
  gates: filterIfEmpty,
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
  demands: filterIfEmpty,
  parallelExecution: agentDeploymentInputParallelExecution,
  artifactsDownloadInput: agentDeploymentInputArtifactsDownloadInput,
}

const exportAgentDeploymentInputParallelExecution: ExecutionInput | object = {
  parallelExecutionType: 'none', // ParallelExecutionTypes.None, bug in API that it comes back as a string
}

const exportAgentDeploymentInputArtifactsDownloadInput:
  | ArtifactsDownloadInput
  | object = {
  downloadInputs: filterIfEmpty,
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
