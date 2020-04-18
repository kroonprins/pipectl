import {
  AgentPoolQueueTarget,
  BuildAuthorizationScope,
  BuildDefinition,
  BuildDefinitionVariable,
  BuildProcess,
  BuildTrigger,
  ContinuousIntegrationTrigger,
  DefinitionQuality,
  DefinitionTriggerType,
  DefinitionType,
  DesignerProcess,
  Phase,
  PhaseTarget,
  ScheduleDays,
  ScheduleTrigger,
} from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { applyExport, array, filterIfEmpty, filterProp, object } from './export'

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
  queue: object({
    _links: filterProp,
    id: filterProp,
    url: filterProp,
    pool: filterProp,
  }),
  queueStatus: filterProp,
  repository: object({
    type: 'TfsGit',
    defaultBranch: 'refs/heads/master',
    clean: 'true',
    checkoutSubmodules: false,
    properties: object({
      id: filterProp,
      cleanOptions: '3',
      labelSources: '0',
      labelSourcesFormat: '$(build.buildNumber)',
      reportBuildStatus: 'true',
      gitLfsSupport: 'false',
      skipSyncSource: 'false',
      checkoutNestedSubmodules: 'false',
      fetchDepth: '0',
    }),
    url: filterProp,
    id: filterProp,
  }),
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
  schedules: array({
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
  }),
}

const exportProcess: BuildProcess = {
  type: 1,
}

const exportDesignerProcess: DesignerProcess | object = {
  phases: array({
    refName: filterProp,
    jobAuthorizationScope: 'projectCollection', // BuildAuthorizationScope.ProjectCollection, (appears to be bug in API that this comes back as a string)
    jobCancelTimeoutInMinutes: 0,
    target: phaseTarget,
    steps: array({
      environment: filterIfEmpty,
      enabled: true,
      continueOnError: false,
      alwaysRun: false,
      timeoutInMinutes: 0,
    }),
  }),
}

const exportDesignerProcessPhaseTarget: PhaseTarget = {
  type: 1, // AgentPoolQueueTarget
}

const exportDesignerProcessPhaseAgentPoolQueueTarget:
  | AgentPoolQueueTarget
  | object = {
  executionOptions: object({
    type: 0, // no parallelism
  }),
  allowScriptsAuthAccessOption: true,
  type: filterProp,
}

const exportVariable: BuildDefinitionVariable = {
  allowOverride: false,
  isSecret: false,
}

export { exportBuildDefinition }
