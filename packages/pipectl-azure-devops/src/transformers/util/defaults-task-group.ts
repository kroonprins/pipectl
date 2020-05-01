import {
  TaskGroup,
  TaskInputDefinition,
  TaskVersion,
} from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { applyDefaults } from './defaults'
import { tasks } from './defaults-common'

const version = async (taskGroup: TaskGroup): Promise<TaskVersion> =>
  applyDefaults(taskGroup.version || {}, defaultsVersion)

const inputs = async (taskGroup: TaskGroup): Promise<TaskInputDefinition[]> => {
  return Promise.all(
    (taskGroup.inputs || []).map((input) => {
      return applyDefaults(input, defaultsInput)
    })
  )
}

const defaultsTaskGroup: TaskGroup | object = {
  version,
  inputs,
  tasks,
}

const defaultsVersion: TaskVersion = {
  major: 1,
  minor: 0,
  patch: 0,
  isTest: false,
}

const defaultsInput: TaskInputDefinition = {
  defaultValue: '',
  required: true,
  type: 'string',
  groupName: '',
}

export { defaultsTaskGroup }
