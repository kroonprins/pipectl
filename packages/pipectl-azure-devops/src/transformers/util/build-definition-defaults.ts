import { AgentPoolQueue, AgentPoolQueueTarget, BuildAuthorizationScope, BuildDefinition, BuildDefinitionStep, BuildProcess, BuildRepository, BuildTrigger, ContinuousIntegrationTrigger, DefinitionQuality, DefinitionTriggerType, DefinitionType, DesignerProcess, Phase, PhaseTarget, RetentionPolicy, Schedule, ScheduleDays, ScheduleTrigger, VariableGroup } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { TeamProjectReference } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Definition } from "pipectl-core/dist/model";
import { isNumber } from "util";
import { agentPoolApi } from "../../adapters/agent-pool-api";
import { coreApi } from "../../adapters/core-api";
import { variableGroupApi } from "../../adapters/variable-group-api";
import { applyDefaults } from "./defaults";

const process = async (spec: BuildDefinition, _definition: Definition): Promise<BuildProcess> => {
  const commonDefaultsApplied = await applyDefaults(spec.process || {}, defaultsProcess)
  if (commonDefaultsApplied.type === 1) {
    return applyDefaults(commonDefaultsApplied, defaultsDesignerProcess)
  } // TODO other process types?
  return commonDefaultsApplied
}

const phases = async (process: DesignerProcess): Promise<Phase[]> => {
  return Promise.all(
    [...(process.phases || []).entries()]
      .map(([index, phase]) => applyDefaults(phase, defaultsDesignerProcessPhase, index))
  )
}

const phaseName = async (_phase: Phase, index: number): Promise<string> => {
  return `Phase ${index + 1}`
}

const phaseTarget = async (phase: Phase, _index: number): Promise<PhaseTarget> => {
  const commonDefaultsApplied = await applyDefaults(phase.target || {}, defaultsDesignerProcessPhaseTarget)
  if (commonDefaultsApplied.type === 1) { // AgentPoolQueueTarget
    return applyDefaults(commonDefaultsApplied, defaultsDesignerProcessPhaseAgentPoolQueueTarget)
  } // TODO other target types?
  return commonDefaultsApplied
}

const phaseSteps = async (phase: Phase, _index: number): Promise<BuildDefinitionStep[]> => {
  return Promise.all(
    (phase.steps || [])
      .map(step => applyDefaults(step, defaultsDesignerProcessStep))
  )
}

const project = async (spec: BuildDefinition, definition: Definition): Promise<TeamProjectReference> => {
  if (!spec.hasOwnProperty('project')) {
    return { id: await coreApi.findProjectIdByName(definition.metadata.namespace) }
  } else if (!spec.project!.id) {
    return { id: await coreApi.findProjectIdByName(spec.project!.name || definition.metadata.namespace) }
  }
  return spec.project!
}

const queue = async (spec: BuildDefinition, definition: Definition): Promise<AgentPoolQueue> => {
  let id = spec.queue?.id
  if (spec.hasOwnProperty('queue') && spec.queue && !spec.queue.hasOwnProperty('id') && spec.queue.hasOwnProperty('name')) {
    id = await agentPoolApi.findAgentPoolIdByName(spec.queue.name!, (await project(spec, definition)).id!)
  }
  return { id }
}

const repository = async (spec: BuildDefinition, _definition: Definition): Promise<BuildRepository> => {
  return applyDefaults(spec.repository || {}, defaultsBuildRepository)
}

const buildRepositoryProperties = async (properties?: { [key: string]: string; }): Promise<{ [key: string]: string; }> => {
  return applyDefaults(properties || {}, defaultsBuildRepositoryProperties)
}

const retentionRules = async (spec: BuildDefinition, _definition: Definition): Promise<RetentionPolicy[]> => {
  if (!spec.hasOwnProperty('retentionRules') || !spec.retentionRules || !spec.retentionRules.length) {
    return [defaultsRetentionRule]
  }
  return spec.retentionRules
}

const tags = (spec: BuildDefinition, definition: Definition): string[] => {
  return (spec.tags || []).concat(Object.entries(definition.metadata.labels || {}).map(([k, v]) => `${k}=${v}`))
}

const triggers = async (spec: BuildDefinition, _definition: Definition): Promise<BuildTrigger[]> => {
  return Promise.all(
    (spec.triggers || [])
      .map(trigger => {
        if (trigger.triggerType === DefinitionTriggerType.ContinuousIntegration) {
          return applyDefaults(trigger, defaultsContinuousIntegrationTrigger)
        } else if (trigger.triggerType === DefinitionTriggerType.Schedule) {
          return applyDefaults(trigger, defaultsScheduleTrigger)
        } // TODO other trigger types
        return Object.assign({}, trigger)
      })
  )
}

const schedules = async (scheduleTrigger: ScheduleTrigger): Promise<Schedule[]> => {
  return Promise.all(
    (scheduleTrigger.schedules || [])
      .map(schedule => applyDefaults(schedule, defaultsSchedule))
  )
}

const variableGroups = async (spec: BuildDefinition, definition: Definition): Promise<VariableGroup[]> => {
  const projectId = (await project(spec, definition)).id
  return Promise.all(
    (spec.variableGroups || [])
      .map(variableGroup => applyDefaults(variableGroup, defaultsVariableGroup, projectId))
  )
}

const variableGroupId = async (variableGroup: VariableGroup, project: string): Promise<VariableGroup> => {
  let id = variableGroup.id
  if (!variableGroup.id) {
    if (variableGroup.name) {
      id = await variableGroupApi.findVariableGroupIdByName(variableGroup.name, project)
    } else if (typeof variableGroup === 'string' || isNumber(variableGroup)) {
      if (isNumber(variableGroup)) {
        id = variableGroup
      } else {
        id = await variableGroupApi.findVariableGroupIdByName(variableGroup, project)
      }
    }
  }
  return { id }
}

const defaultsBuildDefinition: BuildDefinition | object = {
  type: DefinitionType.Build,
  jobAuthorizationScope: BuildAuthorizationScope.ProjectCollection,
  jobTimeoutInMinutes: 60,
  jobCancelTimeoutInMinutes: 5,
  path: '\\',
  process,
  project,
  quality: DefinitionQuality.Definition,
  queue,
  repository,
  retentionRules, // TODO is this still actually supported in latest azure devops? (seems to have been moved to the project level according to UI)
  tags,
  triggers,
  variableGroups,
}

const defaultsProcess: BuildProcess = {
  type: 1,
}

const defaultsDesignerProcess: DesignerProcess | object = {
  phases,
}

const defaultsDesignerProcessPhase: Phase | object = {
  name: phaseName,
  jobAuthorizationScope: BuildAuthorizationScope.ProjectCollection,
  jobCancelTimeoutInMinutes: 0,
  target: phaseTarget,
  steps: phaseSteps,
}

const defaultsDesignerProcessPhaseTarget: PhaseTarget = {
  type: 1,  // AgentPoolQueueTarget
}

const defaultsDesignerProcessPhaseAgentPoolQueueTarget: AgentPoolQueueTarget = {
  executionOptions: {
    type: 0 // no parallelism
  },
  allowScriptsAuthAccessOption: true,
}

const defaultsDesignerProcessStep: BuildDefinitionStep | object = {
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

const defaultsBuildRepositoryProperties: { [key: string]: string; } = {
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
  daysToBuild: ScheduleDays.Monday + ScheduleDays.Tuesday + ScheduleDays.Wednesday + ScheduleDays.Thursday + ScheduleDays.Friday,
  startHours: 0,
  startMinutes: 0,
  timeZoneId: 'UTC' // Timezone column on this page https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/default-time-zones, TODO can get it from script execution environment?,
}

const defaultsVariableGroup: VariableGroup | object = {
  id: variableGroupId,
}

export { defaultsBuildDefinition };

