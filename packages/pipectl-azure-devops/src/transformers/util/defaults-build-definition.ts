import { Definition } from '@kroonprins/pipectl/dist/model'
import {
  AgentPoolQueue,
  AgentPoolQueueTarget,
  AgentTargetExecutionOptions,
  BuildAuthorizationScope,
  BuildCompletionTrigger,
  BuildDefinition,
  BuildDefinitionStep,
  BuildDefinitionVariable,
  BuildProcess,
  BuildRepository,
  BuildTrigger,
  ContinuousIntegrationTrigger,
  DefinitionQuality,
  DefinitionReference,
  DefinitionTriggerType,
  DefinitionType,
  DesignerProcess,
  Phase,
  PhaseTarget,
  RetentionPolicy,
  Schedule,
  ScheduleDays,
  ScheduleTrigger,
  VariableGroup,
} from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { TeamProjectReference } from 'azure-devops-node-api/interfaces/CoreInterfaces'
import { isNumber } from 'util'
import { agentPoolApi } from '../../adapters/agent-pool-api'
import { buildApi } from '../../adapters/build-api'
import { coreApi } from '../../adapters/core-api'
import { gitRepositoryApi } from '../../adapters/git-repository-api'
import { variableGroupApi } from '../../adapters/variable-group-api'
import { applyDefaults } from './defaults'

const process = async (
  buildDefinition: BuildDefinition
): Promise<BuildProcess> => {
  const commonDefaultsApplied = await applyDefaults(
    buildDefinition.process || {},
    defaultsProcess
  )
  if (commonDefaultsApplied.type === 1) {
    return applyDefaults(commonDefaultsApplied, defaultsDesignerProcess)
  } // TODO other process types?
  return commonDefaultsApplied
}

const phases = async (designerProcess: DesignerProcess): Promise<Phase[]> => {
  return Promise.all(
    [...(designerProcess.phases || []).entries()].map(([index, phase]) =>
      applyDefaults(phase, defaultsDesignerProcessPhase, index)
    )
  )
}

const phaseName = async (
  _phase: Phase,
  _key: string,
  index: number
): Promise<string> => {
  return `Phase ${index + 1}`
}

const phaseTarget = async (phase: Phase): Promise<PhaseTarget> => {
  const commonDefaultsApplied = await applyDefaults(
    phase.target || {},
    defaultsDesignerProcessPhaseTarget
  )
  if (commonDefaultsApplied.type === 1) {
    // AgentPoolQueueTarget
    return applyDefaults(
      commonDefaultsApplied,
      defaultsDesignerProcessPhaseAgentPoolQueueTarget
    )
  } // TODO other target types?
  return commonDefaultsApplied
}

const designerProcessPhaseAgentPoolQueueTargetExecutionOptions = async (
  agentPoolQueueTarget: AgentPoolQueueTarget
): Promise<AgentTargetExecutionOptions> => {
  return applyDefaults(
    agentPoolQueueTarget.executionOptions || {},
    defaultsDesignerProcessPhaseAgentPoolQueueTargetExecutionOptions
  )
}

const phaseSteps = async (phase: Phase): Promise<BuildDefinitionStep[]> => {
  return Promise.all(
    (phase.steps || []).map((step) =>
      applyDefaults(step, defaultsDesignerProcessStep)
    )
  )
}

const project = async (
  buildDefinition: BuildDefinition,
  _key: string,
  definition: Definition
): Promise<TeamProjectReference> => {
  if (!buildDefinition.hasOwnProperty('project')) {
    return {
      id: await coreApi.findProjectIdByName(definition.metadata.namespace),
    }
  } else if (!buildDefinition.project!.id) {
    return {
      id: await coreApi.findProjectIdByName(
        buildDefinition.project!.name || definition.metadata.namespace
      ),
    }
  }
  return buildDefinition.project!
}

const queue = async (
  buildDefinition: BuildDefinition,
  key: string,
  definition: Definition
): Promise<AgentPoolQueue> => {
  let id = buildDefinition.queue?.id
  if (
    buildDefinition.hasOwnProperty('queue') &&
    buildDefinition.queue &&
    !buildDefinition.queue.hasOwnProperty('id') &&
    buildDefinition.queue.hasOwnProperty('name')
  ) {
    id = await agentPoolApi.findAgentPoolIdByName(
      buildDefinition.queue.name!,
      (await project(buildDefinition, key, definition)).id!
    )
  }
  return { id }
}

const repository = async (
  buildDefinition: BuildDefinition,
  key: string,
  definition: Definition
): Promise<BuildRepository> => {
  const defaultsApplied = await applyDefaults(
    buildDefinition.repository || {},
    defaultsBuildRepository
  )
  if (
    !defaultsApplied.hasOwnProperty('id') &&
    defaultsApplied.hasOwnProperty('name')
  ) {
    defaultsApplied.id = await gitRepositoryApi.findGitRepositoryIdByName(
      defaultsApplied.name!,
      (await project(buildDefinition, key, definition)).id!
    )
  }
  return defaultsApplied
}

const buildRepositoryProperties = async (
  buildRepository: BuildRepository
): Promise<{ [key: string]: string }> => {
  return applyDefaults(
    buildRepository.properties || {},
    defaultsBuildRepositoryProperties
  )
}

const retentionRules = async (
  buildDefinition: BuildDefinition
): Promise<RetentionPolicy[]> => {
  if (
    !buildDefinition.hasOwnProperty('retentionRules') ||
    !buildDefinition.retentionRules ||
    !buildDefinition.retentionRules.length
  ) {
    return [defaultsRetentionRule]
  }
  return buildDefinition.retentionRules
}

const tags = (
  buildDefinition: BuildDefinition,
  _key: string,
  definition: Definition
): string[] => {
  return (buildDefinition.tags || []).concat(
    Object.entries(definition.metadata.labels || {}).map(
      ([k, v]) => `${k}=${v}`
    )
  )
}

const triggers = async (
  buildDefinition: BuildDefinition,
  key: string,
  definition: Definition
): Promise<BuildTrigger[]> => {
  return Promise.all(
    (buildDefinition.triggers || []).map(async (trigger) => {
      if (trigger.triggerType === DefinitionTriggerType.ContinuousIntegration) {
        return applyDefaults(trigger, defaultsContinuousIntegrationTrigger)
      } else if (trigger.triggerType === DefinitionTriggerType.Schedule) {
        return applyDefaults(trigger, defaultsScheduleTrigger)
      } else if (
        trigger.triggerType === DefinitionTriggerType.BuildCompletion
      ) {
        return applyDefaults(
          trigger,
          defaultsBuildCompletion,
          (await project(buildDefinition, key, definition)).id
        )
      } // TODO other trigger types
      return Object.assign({}, trigger)
    })
  )
}

const schedules = async (
  scheduleTrigger: ScheduleTrigger
): Promise<Schedule[]> => {
  return Promise.all(
    (scheduleTrigger.schedules || []).map((schedule) =>
      applyDefaults(schedule, defaultsSchedule)
    )
  )
}

const buildCompletionTriggerDefinition = async (
  buildCompletionTrigger: BuildCompletionTrigger,
  _key: string,
  projectId: string
): Promise<DefinitionReference | undefined> => {
  if (
    buildCompletionTrigger.definition &&
    !buildCompletionTrigger.definition.hasOwnProperty('id')
  ) {
    const buildDefinition = await buildApi.findBuildDefinitionByNameAndPath(
      buildCompletionTrigger.definition.name!,
      buildCompletionTrigger.definition.path!,
      projectId
    )
    return { id: buildDefinition!.id, project: { id: projectId } }
  }
  return buildCompletionTrigger.definition
}

const variables = async (
  buildDefinition: BuildDefinition
): Promise<{ [key: string]: BuildDefinitionVariable }> => {
  return Object.entries(buildDefinition.variables || {})
    .map(([variable, value]) => {
      if (value && value.hasOwnProperty('value')) {
        return { [variable]: value }
      } else {
        return { [variable]: { value: value as string } }
      }
    })
    .reduce(
      (previousValue, currentValue) =>
        Object.assign({}, previousValue, currentValue),
      {}
    )
}

const variableGroups = async (
  buildDefinition: BuildDefinition,
  key: string,
  definition: Definition
): Promise<VariableGroup[]> => {
  const projectId = (await project(buildDefinition, key, definition)).id
  return Promise.all(
    (buildDefinition.variableGroups || []).map((variableGroup) =>
      applyDefaults(variableGroup, defaultsVariableGroup, projectId)
    )
  )
}

const variableGroupId = async (
  variableGroup: VariableGroup,
  _key: string,
  projectId: string
): Promise<number | undefined> => {
  let id = variableGroup.id
  if (!variableGroup.id) {
    if (variableGroup.name) {
      id = await variableGroupApi.findVariableGroupIdByName(
        variableGroup.name,
        projectId
      )
    } else if (typeof variableGroup === 'string' || isNumber(variableGroup)) {
      if (isNumber(variableGroup)) {
        id = variableGroup
      } else {
        id = await variableGroupApi.findVariableGroupIdByName(
          variableGroup,
          projectId
        )
      }
    }
  }
  return id
}

const defaultsBuildDefinition: BuildDefinition | object = {
  type: DefinitionType.Build,
  jobAuthorizationScope: BuildAuthorizationScope.ProjectCollection,
  jobTimeoutInMinutes: 60,
  jobCancelTimeoutInMinutes: 5,
  path: '\\',
  quality: DefinitionQuality.Definition,
  process,
  project,
  queue,
  repository,
  retentionRules, // TODO is this still actually supported in latest azure devops? (seems to have been moved to the project level according to UI)
  tags,
  triggers,
  variableGroups,
  variables,
}

const defaultsProcess: BuildProcess = {
  type: 1,
}

const defaultsDesignerProcess: DesignerProcess | object = {
  phases,
}

const defaultsDesignerProcessPhase: Phase | object = {
  condition: 'succeeded()',
  name: phaseName,
  jobAuthorizationScope: BuildAuthorizationScope.ProjectCollection,
  jobCancelTimeoutInMinutes: 0,
  target: phaseTarget,
  steps: phaseSteps,
}

const defaultsDesignerProcessPhaseTarget: PhaseTarget = {
  type: 1, // AgentPoolQueueTarget
}

const defaultsDesignerProcessPhaseAgentPoolQueueTarget:
  | AgentPoolQueueTarget
  | object = {
  executionOptions: designerProcessPhaseAgentPoolQueueTargetExecutionOptions,
  allowScriptsAuthAccessOption: true,
}

const defaultsDesignerProcessPhaseAgentPoolQueueTargetExecutionOptions: AgentTargetExecutionOptions = {
  type: 0, // no parallelism
}

const defaultsDesignerProcessStep: BuildDefinitionStep | object = {
  condition: 'succeeded()',
  enabled: true,
  continueOnError: false,
  alwaysRun: false,
  timeoutInMinutes: 0,
}

const defaultsBuildRepository: BuildRepository | object = {
  type: 'TfsGit',
  defaultBranch: 'refs/heads/master',
  clean: 'true',
  checkoutSubmodules: false,
  properties: buildRepositoryProperties,
}

const defaultsBuildRepositoryProperties: { [key: string]: string } = {
  cleanOptions: '3',
  labelSources: '0',
  labelSourcesFormat: '$(build.buildNumber)',
  reportBuildStatus: 'true',
  gitLfsSupport: 'false',
  skipSyncSource: 'false',
  checkoutNestedSubmodules: 'false',
  fetchDepth: '0',
}

const defaultsRetentionRule: RetentionPolicy = {
  branches: ['+refs/heads/*'],
  artifacts: [],
  artifactTypesToDelete: ['FilePath', 'SymbolStore'],
  daysToKeep: 10,
  minimumToKeep: 1,
  deleteBuildRecord: true,
  deleteTestResults: true,
}

const defaultsContinuousIntegrationTrigger: ContinuousIntegrationTrigger = {
  branchFilters: ['+refs/heads/master'],
  pathFilters: [],
  batchChanges: true,
  maxConcurrentBuildsPerBranch: 1,
  pollingInterval: 0,
}

const defaultsScheduleTrigger: ScheduleTrigger | object = {
  schedules,
}

const defaultsSchedule: Schedule = {
  scheduleOnlyWithChanges: true,
  branchFilters: ['+refs/heads/master'],
  daysToBuild:
    ScheduleDays.Monday +
    ScheduleDays.Tuesday +
    ScheduleDays.Wednesday +
    ScheduleDays.Thursday +
    ScheduleDays.Friday,
  startHours: 0,
  startMinutes: 0,
  timeZoneId: 'UTC', // Timezone column on this page https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/default-time-zones, TODO can get it from script execution environment?,
}

const defaultsBuildCompletion: BuildCompletionTrigger | object = {
  requiresSuccessfulBuild: true,
  branchFilters: ['+refs/heads/master'],
  definition: buildCompletionTriggerDefinition,
}

const defaultsVariableGroup: VariableGroup | object = {
  id: variableGroupId,
}

export { defaultsBuildDefinition }
