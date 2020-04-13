import {
  AgentPoolQueue,
  AgentPoolQueueTarget,
  AgentTargetExecutionOptions,
  BuildAuthorizationScope,
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
  Schedule,
  ScheduleDays,
  ScheduleTrigger,
} from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { applyExport, filterProp } from './export'

const drafts = async (
  buildDefinition: BuildDefinition
): Promise<DefinitionReference[] | undefined> => {
  return (buildDefinition.drafts || []).length !== 0
    ? buildDefinition.drafts
    : undefined
}

const process = async (
  buildDefinition: BuildDefinition
): Promise<BuildProcess> => {
  const commonExportApplied = await applyExport(
    buildDefinition.process || {},
    exportProcess
  )
  if (buildDefinition.process) {
    if (buildDefinition.process.type === 1) {
      return applyExport(commonExportApplied, exportDesignerProcess)
    } // TODO other process types?
  }
  return commonExportApplied
}

const phases = async (designerProcess: DesignerProcess): Promise<Phase[]> => {
  return Promise.all(
    (designerProcess.phases || []).map((phase) =>
      applyExport(phase, exportDesignerProcessPhase)
    )
  )
}

const phaseTarget = async (phase: Phase): Promise<PhaseTarget | undefined> => {
  let target = await applyExport(
    phase.target || {},
    exportDesignerProcessPhaseTarget
  )
  if (phase.target) {
    if (phase.target.type === 1) {
      // AgentPoolQueueTarget
      target = await applyExport(
        target,
        exportDesignerProcessPhaseAgentPoolQueueTarget
      )
    } // TODO other target types?
  }
  return Object.keys(target).length !== 0 ? target : undefined
}

const designerProcessPhaseAgentPoolQueueTargetExecutionOptions = async (
  agentPoolQueueTarget: AgentPoolQueueTarget
): Promise<AgentTargetExecutionOptions | undefined> => {
  const executionOptions = applyExport(
    agentPoolQueueTarget.executionOptions || {},
    exportDesignerProcessPhaseAgentPoolQueueTargetExecutionOptions
  )
  return Object.keys(executionOptions).length !== 0
    ? executionOptions
    : undefined
}

const phaseSteps = async (phase: Phase): Promise<BuildDefinitionStep[]> => {
  return Promise.all(
    (phase.steps || []).map((step) =>
      applyExport(step, exportDesignerProcessStep)
    )
  )
}

const designerProcessStepEnvironment = async (
  buildDefinitionStep: BuildDefinitionStep
): Promise<{ [key: string]: string } | undefined> => {
  return Object.keys(buildDefinitionStep.environment || {}).length !== 0
    ? buildDefinitionStep.environment
    : undefined
}

const properties = async (buildDefinition: BuildDefinition): Promise<any> => {
  return Object.keys(buildDefinition.properties).length !== 0
    ? buildDefinition.properties
    : undefined
}

const queue = async (
  buildDefinition: BuildDefinition
): Promise<AgentPoolQueue | undefined> => {
  return buildDefinition.queue
    ? applyExport(buildDefinition.queue, exportQueue)
    : undefined
}

const repository = async (
  buildDefinition: BuildDefinition
): Promise<BuildRepository> => {
  return applyExport(buildDefinition.repository || {}, exportBuildRepository)
}

const buildRepositoryProperties = async (
  buildRepository: BuildRepository
): Promise<{ [key: string]: string } | undefined> => {
  const exportedProperties = applyExport(
    buildRepository.properties || {},
    exportBuildRepositoryProperties
  )
  return Object.keys(exportedProperties).length !== 0
    ? exportedProperties
    : undefined
}

const tags = async (buildDefinition: BuildDefinition): Promise<any> => {
  return (buildDefinition.tags || []).length !== 0
    ? buildDefinition.tags
    : undefined
}

const triggers = async (
  buildDefinition: BuildDefinition
): Promise<BuildTrigger[]> => {
  return Promise.all(
    (buildDefinition.triggers || []).map((trigger) => {
      if (trigger.triggerType === DefinitionTriggerType.ContinuousIntegration) {
        return applyExport(trigger, exportContinuousIntegrationTrigger)
      } else if (trigger.triggerType === DefinitionTriggerType.Schedule) {
        return applyExport(trigger, exportScheduleTrigger)
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
      applyExport(schedule, exportSchedule)
    )
  )
}

const variableGroups = async (
  buildDefinition: BuildDefinition
): Promise<string[] | undefined> => {
  const vars = (buildDefinition.variableGroups || []).map(
    (v) => v.name || v.id!.toString()
  )
  return vars.length !== 0 ? vars : undefined
}

const variables = async (
  buildDefinition: BuildDefinition
): Promise<
  | { [key: string]: BuildDefinitionVariable }
  | { [key: string]: string | undefined }
  | undefined
> => {
  const vars = (
    await Promise.all(
      Object.entries(buildDefinition.variables || {}).map(
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

const exportBuildDefinition: BuildDefinition | object = {
  type: DefinitionType.Build,
  jobAuthorizationScope: BuildAuthorizationScope.ProjectCollection,
  jobTimeoutInMinutes: 60,
  jobCancelTimeoutInMinutes: 5,
  path: '\\',
  quality: DefinitionQuality.Definition,
  _links: filterProp,
  authoredBy: filterProp,
  createdDate: filterProp,
  drafts,
  id: filterProp,
  process,
  project: filterProp,
  properties,
  queue,
  queueStatus: filterProp,
  repository,
  revision: filterProp,
  tags,
  triggers,
  uri: filterProp,
  url: filterProp,
  variables,
  variableGroups,
}

const exportContinuousIntegrationTrigger: ContinuousIntegrationTrigger = {
  pathFilters: [], // TODO array
  batchChanges: true,
  maxConcurrentBuildsPerBranch: 1,
  pollingInterval: 0,
}

const exportScheduleTrigger: ScheduleTrigger | object = {
  schedules,
}

const exportSchedule: Schedule = {
  scheduleOnlyWithChanges: true,
  branchFilters: ['+refs/heads/master'], // TODO array
  daysToBuild:
    ScheduleDays.Monday +
    ScheduleDays.Tuesday +
    ScheduleDays.Wednesday +
    ScheduleDays.Thursday +
    ScheduleDays.Friday,
  startHours: 0,
  startMinutes: 0,
  timeZoneId: 'UTC',
}

const exportProcess: BuildProcess = {
  type: 1,
}

const exportDesignerProcess: DesignerProcess | object = {
  phases,
}

const exportDesignerProcessPhase: Phase | object = {
  refName: filterProp,
  jobAuthorizationScope: 'projectCollection', // BuildAuthorizationScope.ProjectCollection, (appears to be bug in API that this comes back as a string)
  jobCancelTimeoutInMinutes: 0,
  target: phaseTarget,
  steps: phaseSteps,
}

const exportDesignerProcessPhaseTarget: PhaseTarget = {
  type: 1, // AgentPoolQueueTarget
}

const exportDesignerProcessPhaseAgentPoolQueueTarget:
  | AgentPoolQueueTarget
  | object = {
  executionOptions: designerProcessPhaseAgentPoolQueueTargetExecutionOptions,
  allowScriptsAuthAccessOption: true,
  type: filterProp,
}

const exportDesignerProcessPhaseAgentPoolQueueTargetExecutionOptions: AgentTargetExecutionOptions = {
  type: 0, // no parallelism
}

const exportDesignerProcessStep: BuildDefinitionStep | object = {
  environment: designerProcessStepEnvironment,
  enabled: true,
  continueOnError: false,
  alwaysRun: false,
  timeoutInMinutes: 0,
}

const exportQueue: AgentPoolQueue | object = {
  _links: filterProp,
  id: filterProp,
  url: filterProp,
  pool: filterProp,
}

const exportBuildRepository: BuildRepository | object = {
  type: 'TfsGit',
  defaultBranch: 'refs/heads/master',
  clean: 'true',
  checkoutSubmodules: false,
  properties: buildRepositoryProperties,
  url: filterProp,
  name: filterProp, // TODO not if repo can be given by name, then replace this by id
}

const exportBuildRepositoryProperties: { [key: string]: string } | object = {
  id: filterProp,
  cleanOptions: '3',
  labelSources: '0',
  labelSourcesFormat: '$(build.buildNumber)',
  reportBuildStatus: 'true',
  gitLfsSupport: 'false',
  skipSyncSource: 'false',
  checkoutNestedSubmodules: 'false',
  fetchDepth: '0',
}

const exportVariable: BuildDefinitionVariable = {
  allowOverride: false,
  isSecret: false,
}

export { exportBuildDefinition }
