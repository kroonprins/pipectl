import {
  BuildDefinitionStep,
  Phase,
  TaskDefinitionReference as BuildTaskDefinitionReference,
} from 'azure-devops-node-api/interfaces/BuildInterfaces'
import {
  TaskDefinitionReference,
  TaskGroup,
  TaskGroupStep,
} from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { taskDefinitionApi } from '../../adapters/task-definition-api'
import { taskGroupApi } from '../../adapters/task-group-api'
import { applyDefaults } from './defaults'

const tasks = async (
  spec: Phase | TaskGroup,
  key: string,
  projectId: string
): Promise<(BuildDefinitionStep | TaskGroupStep)[]> => {
  return Promise.all(
    (
      (spec as any)[key] || []
    ).map((step: BuildDefinitionStep | TaskGroupStep) =>
      applyDefaults(step, defaultsStep, projectId)
    )
  )
}

const task = async (
  step: BuildDefinitionStep | TaskGroupStep,
  key: string,
  projectId: string
): Promise<BuildTaskDefinitionReference | TaskDefinitionReference> => {
  const defaultsApplied = (await applyDefaults(
    (step as any)[key] || {},
    defaultsTask
  )) as BuildTaskDefinitionReference | TaskDefinitionReference
  if (
    !(defaultsApplied.hasOwnProperty('id') && defaultsApplied.id) &&
    defaultsApplied.hasOwnProperty('name') &&
    (defaultsApplied as any).name
  ) {
    if (defaultsApplied.definitionType === 'task') {
      defaultsApplied.id = await taskDefinitionApi.findTaskDefinitionIdByName(
        (defaultsApplied as any).name,
        defaultsApplied.versionSpec
      )
    } else if (defaultsApplied.definitionType === 'metaTask') {
      // metaTask = task group
      defaultsApplied.id = await taskGroupApi.findTaskGroupIdByName(
        (defaultsApplied as any).name,
        defaultsApplied.versionSpec,
        projectId
      )
    }
    delete (defaultsApplied as any).name
  }
  return defaultsApplied
}

const defaultsStep: BuildDefinitionStep | TaskGroupStep | object = {
  condition: 'succeeded()',
  enabled: true,
  continueOnError: false,
  alwaysRun: false,
  timeoutInMinutes: 0,
  task,
}

const defaultsTask:
  | BuildTaskDefinitionReference
  | TaskDefinitionReference
  | object = {
  definitionType: 'task',
  versionSpec: '1.*',
}

export { tasks }
