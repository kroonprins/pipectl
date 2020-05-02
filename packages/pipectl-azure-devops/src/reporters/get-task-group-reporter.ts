import { TaskGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { Kind } from '../model'
import { AzureTaskGroup } from '../model/azure-task-group'
import { GetReporter } from './get-reporter'

class GetTaskGroupReporter extends GetReporter<TaskGroup> {
  constructor() {
    super(Kind.TASK_GROUP)
  }

  columns(): string[] {
    return ['NAME', 'DESCRIPTION']
  }

  line(taskGroup: TaskGroup): { [column: string]: string } {
    return {
      NAME: `${taskGroup.id}${AzureTaskGroup.SEPARATOR}${taskGroup.version?.major}`,
      DESCRIPTION: `${taskGroup.name} (${taskGroup.version?.major}.*)`,
    }
  }
}

export { GetTaskGroupReporter }
