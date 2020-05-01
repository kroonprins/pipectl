import { TaskGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { GetProcessResult } from './get-process-result'

class GetTaskGroupProcessResult extends GetProcessResult<TaskGroup> {}

export { GetTaskGroupProcessResult }
