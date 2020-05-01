import {
  BuildDefinitionStep,
  TaskDefinitionReference as BuildTaskDefinitionReference,
} from 'azure-devops-node-api/interfaces/BuildInterfaces'
import {
  TaskDefinitionReference,
  TaskGroupStep,
} from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { taskDefinitionApi } from '../../adapters/task-definition-api'
import { taskGroupApi } from '../../adapters/task-group-api'
import { applyExport, array, filterIfEmpty } from './export'

const taskDefinitionReference = async (
  spec: BuildDefinitionStep | TaskGroupStep,
  _key: string,
  projectId: string
): Promise<TaskDefinitionReference | BuildTaskDefinitionReference> => {
  const definitionType = spec.task!.definitionType
  const versionSpec = spec.task!.versionSpec
  const exportApplied = await applyExport(spec.task, {
    definitionType: 'task',
    versionSpec: '1.*',
  })
  let name: string | undefined
  if (definitionType === 'task') {
    name = await taskDefinitionApi.findTaskDefinitionNameById(
      exportApplied.id,
      versionSpec
    )
  } else if (definitionType === 'metaTask') {
    name = await taskGroupApi.findTaskGroupNameById(
      exportApplied.id,
      versionSpec,
      projectId
    )
  }
  if (name) {
    const result = {
      name,
      ...exportApplied,
    }
    delete result.id
    return result
  } else {
    return exportApplied
  }
}

const tasks = array({
  environment: filterIfEmpty,
  alwaysRun: false,
  continueOnError: false,
  condition: 'succeeded()',
  enabled: true,
  timeoutInMinutes: 0,
  task: taskDefinitionReference,
})

export { tasks }
