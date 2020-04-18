import { Action, CommonArguments } from '@kroonprins/pipectl/dist/actions/model'
import {
  Definition,
  DefinitionTransformer,
} from '@kroonprins/pipectl/dist/model'
import { log } from '@kroonprins/pipectl/dist/util/logging'
import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { Kind } from '../model'
import { AzureGitRepository } from '../model/azure-git-repository'
import { isAzureDevOps } from '../util'

class GitRepositoryTransformer implements DefinitionTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    _args: CommonArguments
  ): boolean {
    return (
      isAzureDevOps(definition.apiVersion) &&
      definition.kind === Kind.GIT_REPOSITORY &&
      action !== Action.APPLY
    )
  }

  async transform(
    definition: Definition,
    _action: Action,
    _args: CommonArguments
  ) {
    log.debug(
      `[GitRepositoryTransformer.transform] definition[${JSON.stringify(
        definition
      )}]`
    )
    const transformedSpec = await this.setGitRepositoryDefaults(definition)
    return new AzureGitRepository(
      definition,
      definition.apiVersion,
      definition.kind as Kind,
      definition.metadata.namespace,
      transformedSpec
    ) // TODO "as Kind"
  }

  protected async setGitRepositoryDefaults(
    definition: Definition
  ): Promise<GitRepository> {
    return definition.spec as GitRepository
  }
}

export { GitRepositoryTransformer }
