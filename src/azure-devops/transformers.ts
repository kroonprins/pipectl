import { DefinitionTransformer, Definition, TransformedDefinition } from "../core/model";
import { isAzureDevOps } from "./util";
import { Kind, AzureReleaseDefinition, AzureBuildDefinition } from './model'
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { Action, CommonArguments } from "../core/actions/model";

class BuildDefinitionTransformer implements DefinitionTransformer {
    canTransform(definition: Definition): boolean {
        return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.BUILD_DEFINITION
    }
    async transform(definition: Definition, action: Action, args: CommonArguments) {
        return new AzureBuildDefinition(
            definition.apiVersion,
            definition.kind,
            definition.metadata.namespace,
            definition.spec
        )
    }
}

class ReleaseDefinitionTransformer implements DefinitionTransformer {
    canTransform(definition: Definition, action: Action, args: CommonArguments): boolean {
        return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.RELEASE_DEFINITION && action !== Action.APPLY
    }
    async transform(definition: Definition, action: Action, args: CommonArguments) {
        console.log('Adding defaults')
        const transformedSpec = this.setReleaseDefinitionDefaults(definition.spec)
        return new AzureReleaseDefinition(
            definition.apiVersion,
            definition.kind,
            definition.metadata.namespace,
            transformedSpec
        )
    }

    protected setReleaseDefinitionDefaults(spec: object): ReleaseDefinition {
        // TODO clone?
        const updatedSpec = spec as ReleaseDefinition
        if (!updatedSpec.hasOwnProperty('path')) updatedSpec.path = "\\"
        return updatedSpec
    }
}

class ApplyReleaseDefinitionTransformer extends ReleaseDefinitionTransformer { // TODO instead of this, maybe possible to have multiple transformers applied (first ReleaseDefinitionTransformer for all then this one if action === Action.APPLY)?
    canTransform(definition: Definition, action: Action, args: CommonArguments): boolean {
        return isAzureDevOps(definition.apiVersion) && definition.kind === Kind.RELEASE_DEFINITION && action === Action.APPLY
    }
    protected setReleaseDefinitionDefaults(spec: object): ReleaseDefinition {
        console.log('Adding defaults for apply')
        const updatedSpec = super.setReleaseDefinitionDefaults(spec)

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

        updatedSpec.artifacts?.forEach(artifact => {
            if (artifact.type === 'Build') {
                if (!artifact.hasOwnProperty('definitionReference')) artifact.definitionReference = {}
                const defaultVersionType = artifact.definitionReference!['defaultVersionType'] || {}
                if (!defaultVersionType.hasOwnProperty('id')) defaultVersionType['id'] = 'latestType'
                if (!defaultVersionType.hasOwnProperty('name')) defaultVersionType['name'] = 'Latest'
                artifact.definitionReference!['defaultVersionType'] = defaultVersionType
            }
        })

        return updatedSpec
    }
}

export {
    BuildDefinitionTransformer,
    ReleaseDefinitionTransformer,
    ApplyReleaseDefinitionTransformer
}