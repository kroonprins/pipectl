import { ReleaseDefinition } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { Action, CommonArguments } from '../../core/actions/model'
import { Definition } from '../../core/model'
import { buildApi } from '../adapters/build-api'
import { coreApi } from '../adapters/core-api'
import { Kind } from '../model'
import { isAzureDevOps } from '../util'
import { ReleaseDefinitionTransformer } from './release-definition-transformer'

class ApplyReleaseDefinitionTransformer extends ReleaseDefinitionTransformer { // TODO instead of this, maybe possible to have multiple transformers applied (first ReleaseDefinitionTransformer for all then this one if action === Action.APPLY)?
  canTransform(definition: Definition, action: Action, _args: CommonArguments): boolean {
    return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.RELEASE_DEFINITION && action === Action.APPLY
  }
  protected async setReleaseDefinitionDefaults(definition: Definition): Promise<ReleaseDefinition> {
    const updatedSpec = await super.setReleaseDefinitionDefaults(definition)

    // TODO find elegant way to achieve the below

    updatedSpec.environments?.forEach((environment, index) => {
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

      environment.deployPhases?.forEach((deployPhase, deployPhaseIndex) => {
        if (!deployPhase.hasOwnProperty('rank')) deployPhase.rank = deployPhaseIndex + 1
        if (!deployPhase.hasOwnProperty('phaseType')) deployPhase.phaseType = 1 // AgentBasedDeployment

        deployPhase.workflowTasks?.forEach(workflowTask => {
          if (!workflowTask.hasOwnProperty('enabled')) workflowTask.enabled = true
        })
      })

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
    })

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

    return updatedSpec
  }
}

export { ApplyReleaseDefinitionTransformer }

