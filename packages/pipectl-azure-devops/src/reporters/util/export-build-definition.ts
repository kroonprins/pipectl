import {
  AgentPoolQueueTarget,
  BuildAuthorizationScope,
  BuildCompletionTrigger,
  BuildDefinition,
  BuildDefinitionVariable,
  BuildProcess,
  BuildTrigger,
  ContinuousIntegrationTrigger,
  DefinitionQuality,
  DefinitionReference,
  DefinitionTriggerType,
  DefinitionType,
  DesignerProcess,
  Phase,
  PhaseTarget,
  ScheduleDays,
  ScheduleTrigger,
} from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { buildApi } from '../../adapters/build-api'
import {
  applyExport,
  array,
  filterArrayIfEquals,
  filterIfEmpty,
  filterProp,
  object,
} from './export'
import { taskDefinitionReference } from './export-common'

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
      } else if (
        trigger.triggerType === DefinitionTriggerType.BuildCompletion
      ) {
        return applyExport(trigger, exportBuildCompletion)
      } // TODO other trigger types
      return Object.assign({}, trigger)
    })
  )

const buildCompletionTriggerDefinition = async (
  buildCompletionTrigger: BuildCompletionTrigger
): Promise<DefinitionReference> => {
  const exportApplied = await applyExport(
    buildCompletionTrigger.definition,
    exportBuildCompletionTriggerDefinition
  )
  const buildDefinition = await buildApi.findBuildDefinitionById(
    buildCompletionTrigger.definition!.id!,
    buildCompletionTrigger.definition!.project!.id!
  )
  exportApplied.name = buildDefinition.name!
  exportApplied.path = buildDefinition.path
  delete exportApplied.id
  delete exportApplied.project
  return exportApplied
}

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
  processParameters: filterIfEmpty,
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
  retentionRules: array({
    branches: array('+refs/heads/*'),
    artifacts: filterIfEmpty,
    artifactTypesToDelete: filterArrayIfEquals(['FilePath', 'SymbolStore']),
    daysToKeep: 10,
    minimumToKeep: 1,
    deleteBuildRecord: true,
    deleteTestResults: true,
  }),
  revision: filterProp,
  tags: filterIfEmpty,
  triggers,
  uri: filterProp,
  url: filterProp,
  variables,
  variableGroups,
}

const exportContinuousIntegrationTrigger:
  | ContinuousIntegrationTrigger
  | object = {
  pathFilters: filterIfEmpty,
  branchFilters: filterArrayIfEquals(['+refs/heads/master']),
  batchChanges: true,
  maxConcurrentBuildsPerBranch: 1,
  pollingInterval: 0,
}

const exportScheduleTrigger: ScheduleTrigger | object = {
  schedules: array({
    scheduleOnlyWithChanges: true,
    branchFilters: filterArrayIfEquals(['+refs/heads/master']),
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

const exportBuildCompletion: BuildCompletionTrigger | object = {
  branchFilters: filterArrayIfEquals(['+refs/heads/master']),
  requiresSuccessfulBuild: true,
  definition: buildCompletionTriggerDefinition,
}

const exportBuildCompletionTriggerDefinition: DefinitionReference | object = {
  url: filterProp,
  queueStatus: filterProp,
}

const exportProcess: BuildProcess = {
  type: 1,
}

const exportDesignerProcess: DesignerProcess | object = {
  phases: array({
    condition: 'succeeded()',
    refName: filterProp,
    jobAuthorizationScope: 'projectCollection', // BuildAuthorizationScope.ProjectCollection, (appears to be bug in API that this comes back as a string)
    jobCancelTimeoutInMinutes: 0,
    target: phaseTarget,
    steps: array({
      environment: filterIfEmpty,
      enabled: true,
      condition: 'succeeded()',
      continueOnError: false,
      alwaysRun: false,
      timeoutInMinutes: 0,
      task: taskDefinitionReference,
      inputs: filterIfEmpty,
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
