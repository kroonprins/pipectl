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
  DefinitionTriggerType,
  DefinitionType,
  DesignerProcess,
  Phase,
  PhaseTarget,
  Schedule,
  ScheduleDays,
  ScheduleTrigger,
} from 'azure-devops-node-api/interfaces/BuildInterfaces'
import {
  applyExport,
  applyExportOnArray,
  filterIfEmpty,
  filterProp,
} from './export'

const process = async (
  buildDefinition: BuildDefinition
): Promise<BuildProcess> => {
  const commonExportApplied = await applyExport(
    buildDefinition.process,
    exportProcess
  )
  if (buildDefinition.process) {
    if (buildDefinition.process.type === 1) {
      return applyExport(commonExportApplied, exportDesignerProcess)
    } // TODO other process types?
  }
  return commonExportApplied
}

const phases = async (designerProcess: DesignerProcess): Promise<Phase[]> =>
  applyExportOnArray(designerProcess.phases, exportDesignerProcessPhase)

const phaseTarget = async (phase: Phase): Promise<PhaseTarget> => {
  const target = await applyExport(
    phase.target,
    exportDesignerProcessPhaseTarget
  )
  if (phase.target) {
    if (phase.target.type === 1) {
      // AgentPoolQueueTarget
      return applyExport(target, exportDesignerProcessPhaseAgentPoolQueueTarget)
    } // TODO other target types?
  }
  return target
}

const designerProcessPhaseAgentPoolQueueTargetExecutionOptions = async (
  agentPoolQueueTarget: AgentPoolQueueTarget
): Promise<AgentTargetExecutionOptions> =>
  applyExport(
    agentPoolQueueTarget.executionOptions,
    exportDesignerProcessPhaseAgentPoolQueueTargetExecutionOptions
  )

const phaseSteps = async (phase: Phase): Promise<BuildDefinitionStep[]> =>
  applyExportOnArray(phase.steps, exportDesignerProcessStep)

const queue = async (
  buildDefinition: BuildDefinition
): Promise<AgentPoolQueue> => applyExport(buildDefinition.queue, exportQueue)

const repository = async (
  buildDefinition: BuildDefinition
): Promise<BuildRepository> =>
  applyExport(buildDefinition.repository, exportBuildRepository)

const buildRepositoryProperties = async (
  buildRepository: BuildRepository
): Promise<{ [key: string]: string } | undefined> =>
  applyExport(buildRepository.properties, exportBuildRepositoryProperties)

const triggers = async (
  buildDefinition: BuildDefinition
): Promise<BuildTrigger[]> =>
  Promise.all(
    (buildDefinition.triggers || []).map((trigger) => {
      if (trigger.triggerType === DefinitionTriggerType.ContinuousIntegration) {
        return applyExport(trigger, exportContinuousIntegrationTrigger)
      } else if (trigger.triggerType === DefinitionTriggerType.Schedule) {
        return applyExport(trigger, exportScheduleTrigger)
      } // TODO other trigger types
      return Object.assign({}, trigger)
    })
  )

const schedules = async (
  scheduleTrigger: ScheduleTrigger
): Promise<Schedule[]> =>
  applyExportOnArray(scheduleTrigger.schedules, exportSchedule)

const variableGroups = async (
  buildDefinition: BuildDefinition
): Promise<string[] | undefined> =>
  (buildDefinition.variableGroups || []).map((v) => v.name || v.id!.toString())

const variables = async (
  buildDefinition: BuildDefinition
): Promise<
  | { [key: string]: BuildDefinitionVariable }
  | { [key: string]: string | undefined }
  | undefined
> =>
  (
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
  drafts: filterIfEmpty,
  id: filterProp,
  process,
  project: filterProp,
  properties: filterIfEmpty,
  queue,
  queueStatus: filterProp,
  repository,
  revision: filterProp,
  tags: filterIfEmpty,
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
  environment: filterIfEmpty,
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
