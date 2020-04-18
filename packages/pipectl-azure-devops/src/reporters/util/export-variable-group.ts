import { filterProp } from './export'
import { VariableGroup } from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'

const variables = (
  variableGroup: VariableGroup
): { [key: string]: string | undefined } =>
  Object.entries(variableGroup.variables || {})
    .map(([variable, value]) => {
      return { [variable]: value.value }
    })
    .reduce(
      (previousValue, currentValue) =>
        Object.assign({}, previousValue, currentValue),
      {}
    )

const exportVariableGroup: VariableGroup | object = {
  type: 'Vsts',
  isShared: false,
  id: filterProp,
  createdBy: filterProp,
  createdOn: filterProp,
  modifiedBy: filterProp,
  modifiedOn: filterProp,
  variableGroupProjectReferences: filterProp,
  variables,
}

export { exportVariableGroup }
