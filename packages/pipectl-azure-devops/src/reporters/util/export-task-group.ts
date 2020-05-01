import { TaskGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { array, filterIfEmpty, filterProp, object } from './export'
import { taskDefinitionReference } from './export-common'

const exportTaskGroup: TaskGroup | object = {
  runsOn: filterProp,
  revision: filterProp,
  createdBy: filterProp,
  createdOn: filterProp,
  modifiedBy: filterProp,
  modifiedOn: filterProp,
  comment: filterIfEmpty,
  id: filterProp,
  version: object({
    minor: filterProp,
    patch: filterProp,
    isTest: false,
  }),
  iconUrl: filterProp,
  definitionType: 'metaTask',
  friendlyName: filterProp,
  description: filterIfEmpty,
  author: filterProp,
  demands: filterIfEmpty,
  groups: filterIfEmpty,
  satisfies: filterIfEmpty,
  sourceDefinitions: filterIfEmpty,
  dataSourceBindings: filterIfEmpty,
  instanceNameFormat: filterProp,
  preJobExecution: filterIfEmpty,
  execution: filterIfEmpty,
  postJobExecution: filterIfEmpty,
  inputs: array({
    aliases: filterIfEmpty,
    options: filterIfEmpty,
    properties: filterIfEmpty,
    label: filterIfEmpty,
    defaultValue: filterIfEmpty,
    required: true,
    type: 'string',
    helpMarkDown: filterIfEmpty,
    groupName: filterIfEmpty,
  }),
  tasks: array({
    environment: filterIfEmpty,
    alwaysRun: false,
    continueOnError: false,
    condition: 'succeeded()',
    enabled: true,
    timeoutInMinutes: 0,
    task: taskDefinitionReference,
  }),
}

export { exportTaskGroup }
