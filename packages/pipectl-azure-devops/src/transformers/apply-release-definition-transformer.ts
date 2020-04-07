import { AgentBasedDeployPhase, ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { Action, CommonArguments } from 'pipectl-core/src/actions/model'
import { Definition } from 'pipectl-core/src/model'
import { log } from 'pipectl-core/src/util/logging'
import { isNumber } from 'util'
import { agentPoolApi } from '../adapters/agent-pool-api'
import { buildApi } from '../adapters/build-api'
import { coreApi } from '../adapters/core-api'
import { variableGroupApi } from '../adapters/variable-group-api'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'
import { ReleaseDefinitionTransformer } from './release-definition-transformer'

class ApplyReleaseDefinitionTransformer extends ReleaseDefinitionTransformer { // TODO instead of this, maybe possible to have multiple transformers applied (first ReleaseDefinitionTransformer for all then this one if action === Action.APPLY)?

  canTransform(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.RELEASE_DEFINITION && action === Action.APPLY
  }

  protected async setReleaseDefinitionDefaults(definition: Definition): Promise<ReleaseDefinition> {
    log.debug(`[ApplyReleaseDefinitionTransformer.setReleaseDefinitionDefaults] before[${JSON.stringify(definition)}]`)
    const updatedSpec = await super.setReleaseDefinitionDefaults(definition)

    // TODO find elegant way to achieve the below

    for (const [index, environment] of (updatedSpec.environments || []).entries()) {
      if (!environment.hasOwnProperty('rank')) environment.rank = index + 1

      const environmentOptions = environment.environmentOptions || {}
      if (!environmentOptions.hasOwnProperty('emailNotificationType')) environmentOptions.emailNotificationType = 'Always'
      if (!environmentOptions.hasOwnProperty('publishDeploymentStatus')) environmentOptions.publishDeploymentStatus = true
      environment.environmentOptions = environmentOptions

      const executionPolicy = environment.executionPolicy || {}
      if (!executionPolicy.hasOwnProperty('concurrencyCount')) executionPolicy.concurrencyCount = 1
      if (!executionPolicy.hasOwnProperty('queueDepthCount')) executionPolicy.queueDepthCount = 0
      environment.executionPolicy = executionPolicy

      const retentionPolicy = environment.retentionPolicy || {}
      if (!retentionPolicy.hasOwnProperty('daysToKeep')) retentionPolicy.daysToKeep = 30
      if (!retentionPolicy.hasOwnProperty('releasesToKeep')) retentionPolicy.releasesToKeep = 3
      if (!retentionPolicy.hasOwnProperty('retainBuild')) retentionPolicy.retainBuild = true
      environment.retentionPolicy = retentionPolicy


      for (const [deployPhaseIndex, deployPhase] of (environment.deployPhases || []).entries()) {
        if (!deployPhase.hasOwnProperty('rank')) deployPhase.rank = deployPhaseIndex + 1
        if (!deployPhase.hasOwnProperty('phaseType')) deployPhase.phaseType = 1 // AgentBasedDeployment

        deployPhase.workflowTasks?.forEach(workflowTask => {
          if (!workflowTask.hasOwnProperty('enabled')) workflowTask.enabled = true
        })

        if (deployPhase.hasOwnProperty('deploymentInput')) {
          if (deployPhase.phaseType === 1) {
            const deploymentInput = (deployPhase as AgentBasedDeployPhase).deploymentInput!
            if (deploymentInput.hasOwnProperty('queueId') && deploymentInput.queueId && !isNumber(deploymentInput.queueId)) {
              deploymentInput.queueId = await agentPoolApi.findAgentPoolIdByName(deploymentInput.queueId, definition.metadata.namespace)
            }
          } // TODO handle other phaseType
        }
      }

      if (!environment.hasOwnProperty('preDeployApprovals')
        || !environment.preDeployApprovals
        || !environment.preDeployApprovals.hasOwnProperty('approvals')
        || !environment.preDeployApprovals.approvals
        || !environment.preDeployApprovals.approvals.length) {
        environment.preDeployApprovals = {
          approvals: [{
            rank: 1,
            isAutomated: true,
            isNotificationOn: false
          }],
          approvalOptions: {
            releaseCreatorCanBeApprover: false
          }
        }
      } else {
        environment.preDeployApprovals.approvals.forEach((approval, approvalIndex) => {
          if (!approval.hasOwnProperty('rank')) approval.rank = approvalIndex + 1
          if (!approval.hasOwnProperty('isAutomated')) approval.isAutomated = false
          if (!approval.hasOwnProperty('isNotificationOn')) approval.isNotificationOn = false
        })
        const approvalOptions = environment.preDeployApprovals.approvalOptions || {}
        if (!approvalOptions.hasOwnProperty('releaseCreatorCanBeApprover')) approvalOptions.releaseCreatorCanBeApprover = false
        environment.preDeployApprovals.approvalOptions = approvalOptions
      }

      if (!environment.hasOwnProperty('postDeployApprovals')
        || !environment.postDeployApprovals
        || !environment.postDeployApprovals.hasOwnProperty('approvals')
        || !environment.postDeployApprovals.approvals
        || !environment.postDeployApprovals.approvals.length) {
        environment.postDeployApprovals = {
          approvals: [{
            rank: 1,
            isAutomated: true,
            isNotificationOn: false
          }],
          approvalOptions: {
            releaseCreatorCanBeApprover: false
          }
        }
      } else {
        environment.postDeployApprovals.approvals.forEach((approval, approvalIndex) => {
          if (!approval.hasOwnProperty('rank')) approval.rank = approvalIndex + 1
          if (!approval.hasOwnProperty('isAutomated')) approval.isAutomated = false
          if (!approval.hasOwnProperty('isNotificationOn')) approval.isNotificationOn = false
        })
        const approvalOptions = environment.postDeployApprovals.approvalOptions || {}
        if (!approvalOptions.hasOwnProperty('releaseCreatorCanBeApprover')) approvalOptions.releaseCreatorCanBeApprover = false
        environment.postDeployApprovals.approvalOptions = approvalOptions
      }

      if (environment.hasOwnProperty('variableGroups') && environment.variableGroups && environment.variableGroups.length) {
        const variableGroups: number[] = []
        for (let variableGroup of environment.variableGroups) {
          if (!isNumber(variableGroup)) {
            variableGroup = await variableGroupApi.findVariableGroupIdByName(variableGroup, definition.metadata.namespace)
          }
          variableGroups.push(variableGroup)
        }
        environment.variableGroups = variableGroups
      }
    }

    /* tslint:disable:no-string-literal */ // TODO
    for (const artifact of updatedSpec.artifacts || []) {
      if (artifact.type === 'Build') {
        if (!artifact.hasOwnProperty('definitionReference')) artifact.definitionReference = {}
        const defaultVersionType = artifact.definitionReference!['defaultVersionType'] || {}
        if (!defaultVersionType.hasOwnProperty('id')) defaultVersionType['id'] = 'latestType'
        if (!defaultVersionType.hasOwnProperty('name')) defaultVersionType['name'] = 'Latest'
        artifact.definitionReference!['defaultVersionType'] = defaultVersionType

        // TODO handle errors if missing things
        if (!artifact.definitionReference!.hasOwnProperty('project')) {
          artifact.definitionReference!['project'] = { id: await coreApi.findProjectIdByName(definition.metadata.namespace) }
        } else if (!artifact.definitionReference!['project']['id']) {
          artifact.definitionReference!['project']['id'] = await coreApi.findProjectIdByName(artifact.definitionReference!['project']['name'] || definition.metadata.namespace)
        }
        delete artifact.definitionReference!['project']['name']
        if (!artifact.definitionReference!['definition']['id']) {
          const buildName = artifact.definitionReference!['definition']['name']!
          const buildPath = (artifact.definitionReference!['definition'] as any)['path']
          const project = artifact.definitionReference!['project']['id']!
          const buildDefinition = await buildApi.findBuildDefinitionByNameAndPath(buildName, buildPath, project)
          if (buildDefinition) {
            artifact.definitionReference!['definition']['id'] = buildDefinition.id?.toString()
          }
        }
        delete artifact.definitionReference!['definition']['name']
        delete (artifact.definitionReference!['definition'] as any)['path']
      }
    }
    /* tslint:enable */


    log.debug(`[ApplyReleaseDefinitionTransformer.setReleaseDefinitionDefaults] after[${JSON.stringify(updatedSpec)}]`)
    return updatedSpec
  }
}

export { ApplyReleaseDefinitionTransformer }

