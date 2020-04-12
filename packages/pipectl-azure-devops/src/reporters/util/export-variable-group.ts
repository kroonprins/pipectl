import { VariableGroup } from 'azure-devops-node-api/interfaces/BuildInterfaces'
import { filterProp } from './export'

const variables = (variableGroup: VariableGroup): { [key: string]: string | undefined } => {
  return Object.entries(variableGroup.variables || {})
    .map(([variable, value]) => { return { [variable]: value.value } })
    .reduce((previousValue, currentValue) => Object.assign({}, previousValue, currentValue), {})
}

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

