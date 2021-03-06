import { Definition } from '@kroonprins/pipectl/dist/model'
import {
  ProjectReference,
  VariableGroup,
  VariableGroupProjectReference,
  VariableValue,
} from 'azure-devops-node-api/interfaces/TaskAgentInterfaces'
import { applyDefaults } from './defaults'

const variables = async (
  variableGroup: VariableGroup
): Promise<{ [key: string]: VariableValue }> => {
  return Object.entries(variableGroup.variables || {})
    .map(([variable, value]) => {
      if (value && value.hasOwnProperty('value')) {
        return { [variable]: value }
      } else {
        return { [variable]: { value: value as string } }
      }
    })
    .reduce(
      (previousValue, currentValue) =>
        Object.assign({}, previousValue, currentValue),
      {}
    )
}

const variableGroupProjectReferences = async (
  variableGroup: VariableGroup,
  _key: string,
  definition: Definition
): Promise<VariableGroupProjectReference[]> => {
  const project = definition.metadata.namespace
  if (
    variableGroup.hasOwnProperty('variableGroupProjectReferences') &&
    variableGroup.variableGroupProjectReferences &&
    variableGroup.variableGroupProjectReferences.length
  ) {
    return Promise.all(
      variableGroup.variableGroupProjectReferences.map(
        (variableGroupProjectReference) =>
          applyDefaults(
            variableGroupProjectReference,
            defaultsVariableGroupProjectReference,
            project,
            variableGroup
          )
      )
    )
  } else {
    return [
      await applyDefaults(
        {},
        defaultsVariableGroupProjectReference,
        project,
        variableGroup
      ),
    ]
  }
}

const name = async (
  _variableGroupProjectReference: VariableGroupProjectReference,
  _key: string,
  _project: string,
  variableGroup: VariableGroup
): Promise<string> => {
  return variableGroup.name!
}

const projectReference = async (
  _variableGroupProjectReference: VariableGroupProjectReference | undefined,
  _key: string,
  project: string
): Promise<ProjectReference> => {
  return { name: project }
}

const defaultsVariableGroup: VariableGroup | object = {
  type: 'Vsts',
  isShared: false,
  variables,
  variableGroupProjectReferences,
}

const defaultsVariableGroupProjectReference:
  | VariableGroupProjectReference
  | object = {
  name,
  projectReference,
}

export { defaultsVariableGroup }
