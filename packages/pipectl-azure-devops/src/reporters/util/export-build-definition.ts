import {
  AgentPoolQueueTarget,
  BuildAuthorizationScope,
  BuildCompletionTrigger,
  BuildDefinition,
  BuildDefinitionVariable,
  BuildOption,
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
  enumValue,
  filterArrayIfEquals,
  filterIfEmpty,
  filterProp,
  object,
  translateEnumValue,
} from './export'
import { tasks as steps } from './export-common'

const options = async (
  buildDefinition: BuildDefinition
): Promise<BuildOption[]> => {
  return (buildDefinition.options || []).filter((option) => option.enabled)
}

const process = async (
  buildDefinition: BuildDefinition,
  _key: string,
  projectId: string
): Promise<BuildProcess> => {
  const commonExportApplied = await applyExport(
    buildDefinition.process,
    exportProcess
  )
  if (buildDefinition.process) {
    if (buildDefinition.process.type === 1) {
      return applyExport(commonExportApplied, exportDesignerProcess, projectId)
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
    (buildDefinition.triggers || []).map(async (trigger) => {
      const exportApplied = await applyExport(trigger, exportTrigger)
      if (trigger.triggerType === DefinitionTriggerType.ContinuousIntegration) {
        return applyExport(exportApplied, exportContinuousIntegrationTrigger)
      } else if (trigger.triggerType === DefinitionTriggerType.Schedule) {
        return applyExport(exportApplied, exportScheduleTrigger)
      } else if (
        trigger.triggerType === DefinitionTriggerType.BuildCompletion
      ) {
        return applyExport(exportApplied, exportBuildCompletion)
      } // TODO other trigger types
      return exportApplied
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
  type: enumValue(DefinitionType, DefinitionType.Build),
  jobAuthorizationScope: enumValue(
    BuildAuthorizationScope,
    BuildAuthorizationScope.ProjectCollection
  ),
  jobTimeoutInMinutes: 60,
  jobCancelTimeoutInMinutes: 5,
  path: '\\',
  quality: enumValue(DefinitionQuality, DefinitionQuality.Definition),
  _links: filterProp,
  authoredBy: filterProp,
  createdDate: filterProp,
  drafts: filterIfEmpty,
  id: filterProp,
  options,
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
  tags: filterProp, // they are set as labels on the definition
  triggers,
  uri: filterProp,
  url: filterProp,
  variables,
  variableGroups,
}

const exportTrigger: BuildTrigger | object = {
  triggerType: translateEnumValue(DefinitionTriggerType),
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
    steps,
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
