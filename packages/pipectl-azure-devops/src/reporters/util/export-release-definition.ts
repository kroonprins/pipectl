import {
  AgentBasedDeployPhase,
  AgentDeploymentInput,
  Artifact,
  ArtifactSourceReference,
  ConfigurationVariableValue,
  DeployPhase,
  DeployPhaseTypes,
  ReleaseDefinition,
  ReleaseDefinitionApprovals,
  ReleaseDefinitionEnvironment,
  ReleaseDefinitionGatesStep,
} from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { agentPoolApi } from '../../adapters/agent-pool-api'
import { buildApi } from '../../adapters/build-api'
import { variableGroupApi } from '../../adapters/variable-group-api'
import { applyExport, array, filterIfEmpty, filterProp, object } from './export'

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

const exportReleaseDefinitionApprovals: ReleaseDefinitionApprovals | object = {
  approvals: array({
    rank: filterProp,
    isAutomated: true,
    isNotificationOn: false,
    id: filterProp,
  }),
  approvalOptions: object({
    requiredApproverCount: null, // seems bug in API that this comes back as null
    releaseCreatorCanBeApprover: false,
    autoTriggeredAndPreviousEnvironmentApprovedCanBeSkipped: false,
    enforceIdentityRevalidation: false,
    timeoutInMinutes: 0,
    executionOrder: 1,
  }),
}

const exportDeploymentGates: ReleaseDefinitionGatesStep | object = {
  id: filterProp,
  gatesOptions: null,
  gates: filterIfEmpty,
}

const exportReleaseDefinition: ReleaseDefinition | object = {
  _links: filterProp,
  artifacts,
  createdBy: filterProp,
  createdOn: filterProp,
  description: filterIfEmpty,
  environments: array({
    badgeUrl: filterProp,
    conditions: filterIfEmpty,
    currentRelease: filterProp,
    demands: filterIfEmpty,
    deployPhases,
    deployStep: filterProp,
    environmentOptions: object({
      emailNotificationType: 'Always',
      emailRecipients: 'release.environment.owner;release.creator',
      skipArtifactsDownload: false,
      timeoutInMinutes: 0,
      enableAccessToken: false,
      publishDeploymentStatus: true,
      badgeEnabled: false,
      autoLinkWorkItems: false,
      pullRequestDeploymentEnabled: false,
    }),
    environmentTriggers: filterIfEmpty,
    executionPolicy: object({
      concurrencyCount: 1,
      queueDepthCount: 0,
    }),
    id: filterProp,
    owner: filterProp,
    preDeployApprovals: object(exportReleaseDefinitionApprovals),
    preDeploymentGates: object(exportDeploymentGates),
    properties: filterIfEmpty,
    postDeployApprovals: object(exportReleaseDefinitionApprovals),
    postDeploymentGates: object(exportDeploymentGates),
    rank: filterProp,
    retentionPolicy: object({
      daysToKeep: 30,
      releasesToKeep: 3,
      retainBuild: true,
    }),
    schedules: filterIfEmpty,
    variables,
    variableGroups,
  }),
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
  defaultVersionType: object({
    id: 'latestType',
    name: 'Latest',
  }),
  definition: definitionReferenceDefinition,
  project: filterProp,
}

const exportDeployPhase: DeployPhase | object = {
  rank: filterProp,
  phaseType: DeployPhaseTypes.AgentBasedDeployment,
  refName: filterProp,
  workflowTasks: array({
    enabled: true,
    environment: filterProp, // TODO
    refName: filterProp,
    alwaysRun: false,
    continueOnError: false,
    timeoutInMinutes: 0,
    overrideInputs: filterProp, // TODO
  }),
}

const exportAgentBasedDeployPhase: AgentBasedDeployPhase | object = {
  deploymentInput: object({
    skipArtifactsDownload: false,
    enableAccessToken: false,
    timeoutInMinutes: 0,
    jobCancelTimeoutInMinutes: 1,
    condition: 'succeeded()',
    overrideInputs: filterProp, // TODO
    queueId,
    demands: filterIfEmpty,
    parallelExecution: object({
      parallelExecutionType: 'none', // ParallelExecutionTypes.None, bug in API that it comes back as a string
    }),
    artifactsDownloadInput: object({
      downloadInputs: filterIfEmpty,
    }),
  }),
}

const exportVariable: ConfigurationVariableValue = {
  allowOverride: false,
  isSecret: false,
}

export { exportReleaseDefinition }
