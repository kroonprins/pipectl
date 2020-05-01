import { Definition } from '@kroonprins/pipectl/dist/model'
import {
  TaskGroup,
  TaskGroupStep,
  TaskInputDefinition,
  TaskVersion,
} from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { applyDefaults } from './defaults'
import { tasks as steps } from './defaults-common'

const version = async (taskGroup: TaskGroup): Promise<TaskVersion> =>
  applyDefaults(taskGroup.version || {}, defaultsVersion)

const inputs = async (taskGroup: TaskGroup): Promise<TaskInputDefinition[]> => {
  return Promise.all(
    (taskGroup.inputs || []).map((input) => {
      return applyDefaults(input, defaultsInput)
    })
  )
}

const tasks = async (
  taskGroup: TaskGroup,
  key: string,
  definition: Definition
): Promise<TaskGroupStep[]> => {
  return steps(taskGroup, key, definition.metadata.namespace) as Promise<
    TaskGroupStep[]
  >
}

const defaultsTaskGroup: TaskGroup | object = {
  version,
  inputs,
  tasks,
  category: 'Utility',
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
