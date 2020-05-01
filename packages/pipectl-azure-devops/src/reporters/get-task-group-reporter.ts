import { TaskGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { AzureTaskGroup } from '../model/azure-task-group'
import { GetTaskGroupProcessResult } from '../model/get-task-group-process-result'
import { GetReporter } from './get-reporter'

class GetTaskGroupReporter extends GetReporter<
  GetTaskGroupProcessResult,
  AzureTaskGroup,
  TaskGroup
> {
  constructor() {
    super(GetTaskGroupProcessResult)
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
