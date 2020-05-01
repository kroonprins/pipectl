import {
  BuildDefinitionStep,
  TaskDefinitionReference as BuildTaskDefinitionReference,
} from 'azure-devops-node-api/interfaces/BuildInterfaces'
import {
  TaskDefinitionReference,
  TaskGroupStep,
} from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { taskDefinitionApi } from '../../adapters/task-definition-api'
import { applyExport } from './export'

const taskDefinitionReference = async (
  spec: BuildDefinitionStep | TaskGroupStep
): Promise<TaskDefinitionReference | BuildTaskDefinitionReference> => {
  const definitionType = spec.task!.definitionType
  const versionSpec = spec.task!.versionSpec
  const exportApplied = await applyExport(spec.task, {
    definitionType: 'task',
    versionSpec: '1.*',
  })
  if (definitionType === 'task') {
    const name = await taskDefinitionApi.findTaskDefinitionNameById(
      exportApplied.id,
      versionSpec
    )
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
  } else {
    return exportApplied
  }
}

export { taskDefinitionReference }
