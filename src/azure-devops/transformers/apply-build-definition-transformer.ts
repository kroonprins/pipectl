import { AgentPoolQueueTarget, BuildAuthorizationScope, BuildDefinition, ContinuousIntegrationTrigger, DefinitionQuality, DefinitionTriggerType, DesignerProcess, ScheduleDays, ScheduleTrigger } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { Action, CommonArguments } from '../../core/actions/model'
import { Definition } from '../../core/model'
import { coreApi } from '../adapters/core-api'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'
import { BuildDefinitionTransformer } from './build-definition-transformer'

class ApplyBuildDefinitionTransformer extends BuildDefinitionTransformer {
  canTransform(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.BUILD_DEFINITION && action === Action.APPLY
  }
  protected async setBuildDefinitionDefaults(definition: Definition): Promise<BuildDefinition> {
    const updatedSpec = await super.setBuildDefinitionDefaults(definition)

    // TODO find elegant way to achieve the below

    if (!updatedSpec.hasOwnProperty('type')) updatedSpec.type = 2 // non-yaml

    if (!updatedSpec.hasOwnProperty('project')) {
      updatedSpec.project = { id: await coreApi.findProjectIdByName(definition.metadata.namespace) }
    } else if (!updatedSpec.project!.id) {
      updatedSpec.project!.id = await coreApi.findProjectIdByName(updatedSpec.project!.name || definition.metadata.namespace)
    }

    if (updatedSpec.hasOwnProperty('triggers')) {
      for (const trigger of updatedSpec.triggers!) {
        if (trigger.triggerType === DefinitionTriggerType.ContinuousIntegration) {
          const continuousIntegrationTrigger = trigger as ContinuousIntegrationTrigger
          if (!continuousIntegrationTrigger.hasOwnProperty('pathFilters')) continuousIntegrationTrigger.pathFilters = []
          if (!continuousIntegrationTrigger.hasOwnProperty('batchChanges')) continuousIntegrationTrigger.batchChanges = true
          if (!continuousIntegrationTrigger.hasOwnProperty('maxConcurrentBuildsPerBranch')) continuousIntegrationTrigger.maxConcurrentBuildsPerBranch = 1
          if (!continuousIntegrationTrigger.hasOwnProperty('pollingInterval')) continuousIntegrationTrigger.pollingInterval = 0
        } else if (trigger.triggerType === DefinitionTriggerType.Schedule) {
          const scheduleTrigger = trigger as ScheduleTrigger
          if (scheduleTrigger.schedules && scheduleTrigger.schedules.length) {
            for (const schedule of scheduleTrigger.schedules) {
              if (!schedule.hasOwnProperty('pathFiltscheduleOnlyWithChangesers')) schedule.scheduleOnlyWithChanges = true
              if (!schedule.hasOwnProperty('branchFilters')) schedule.branchFilters = ['+refs/heads/master']
              if (!schedule.hasOwnProperty('daysToBuild')) schedule.daysToBuild = ScheduleDays.Monday + ScheduleDays.Tuesday + ScheduleDays.Wednesday + ScheduleDays.Thursday + ScheduleDays.Friday
              if (!schedule.hasOwnProperty('startHours')) schedule.startHours = 0
              if (!schedule.hasOwnProperty('startMinutes')) schedule.startMinutes = 0
              if (!schedule.hasOwnProperty('timeZoneId')) schedule.timeZoneId = 'UTC' // Timezone column on this page https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/default-time-zones, TODO can get it from script execution environment?
            }
          }
        } // TODO other trigger types
      }
    }

    if (!updatedSpec.hasOwnProperty('jobAuthorizationScope')) updatedSpec.jobAuthorizationScope = BuildAuthorizationScope.ProjectCollection
    if (!updatedSpec.hasOwnProperty('jobTimeoutInMinutes')) updatedSpec.jobTimeoutInMinutes = 60
    if (!updatedSpec.hasOwnProperty('jobCancelTimeoutInMinutes')) updatedSpec.jobCancelTimeoutInMinutes = 5
    if (!updatedSpec.hasOwnProperty('quality')) updatedSpec.quality = DefinitionQuality.Definition

    if (updatedSpec.hasOwnProperty('repository')) {
      const repository = updatedSpec.repository!
      if (!repository.hasOwnProperty('type')) repository.type = 'TfsGit'
      if (!repository.hasOwnProperty('defaultBranch')) repository.defaultBranch = 'refs/heads/master'
      if (!repository.hasOwnProperty('clean')) repository.clean = 'true'
      if (!repository.hasOwnProperty('checkoutSubmodules')) repository.checkoutSubmodules = false
      if (!repository.hasOwnProperty('type')) repository.type = 'TfsGit'

      const defaultProperties = {
        cleanOptions: '3',
        labelSources: '0',
        labelSourcesFormat: '$(build.buildNumber)',
        reportBuildStatus: 'true',
        gitLfsSupport: 'false',
        skipSyncSource: 'false',
        checkoutNestedSubmodules: 'false',
        fetchDepth: '0',
      }
      if (repository.hasOwnProperty('properties')) {
        repository.properties = Object.assign(defaultProperties, repository.properties)
      } else {
        repository.properties = defaultProperties
      }
    }

    if (updatedSpec.hasOwnProperty('process')) {
      const process = updatedSpec.process!
      if (!process.hasOwnProperty('type')) process.type = 1

      if (process.type === 1) {
        const designerProcess = process as DesignerProcess
        if (designerProcess && designerProcess.phases && designerProcess.phases.length) {
          for (const [index, phase] of designerProcess.phases.entries()) {
            if (!phase.hasOwnProperty('name')) phase.name = `Phase ${index + 1}`
            if (!phase.hasOwnProperty('jobAuthorizationScope')) phase.jobAuthorizationScope = BuildAuthorizationScope.ProjectCollection
            if (!phase.hasOwnProperty('jobCancelTimeoutInMinutes')) phase.jobCancelTimeoutInMinutes = 1

            const defaultTarget: AgentPoolQueueTarget = {
              executionOptions: {
                type: 0 // no parallelism
              },
              allowScriptsAuthAccessOption: true,
              type: 1 // AgentPoolQueueTarget
            }
            if (!phase.hasOwnProperty('target')) phase.target = defaultTarget

            if (phase.steps && phase.steps.length) {
              for (const step of phase.steps) {
                if (!step.hasOwnProperty('enabled')) step.enabled = true
                if (!step.hasOwnProperty('continueOnError')) step.continueOnError = false
                if (!step.hasOwnProperty('alwaysRun')) step.alwaysRun = false
                if (!step.hasOwnProperty('timeoutInMinutes')) step.timeoutInMinutes = 0
              }
            }
          }
        }
      }
    }

    if (!updatedSpec.hasOwnProperty('retentionRules')) {
      updatedSpec.retentionRules = [
        {
          branches: ['+refs/heads/*'],
          artifacts: [],
          artifactTypesToDelete: ['FilePath', 'SymbolStore'],
          daysToKeep: 10,
          minimumToKeep: 1,
          deleteBuildRecord: true,
          deleteTestResults: true,
        }
      ]
    }

    return updatedSpec
  }
}

export { ApplyBuildDefinitionTransformer }

