import { Artifact, ArtifactSourceReference, ConfigurationVariableValue, ReleaseDefinition, ReleaseDefinitionEnvironment, ReleaseTriggerBase } from 'azure-devops-node-api/interfaces/ReleaseInterfaces'
import { buildApi } from '../../adapters/build-api'
import { variableGroupApi } from '../../adapters/variable-group-api'
import { applyExport, filterProp } from './export'

const artifacts = async (releaseDefinition: ReleaseDefinition): Promise<Artifact[] | undefined> => {
  return Promise.all(
    (releaseDefinition.artifacts || [])
      .map(artifact => {
        if (artifact.type === 'Build') {
          return applyExport(artifact, exportBuildArtifact)
        } // TODO other artifact types?
        return applyExport(artifact, exportArtifact)
      })
  )
}

const definitionReference = async (artifact: Artifact): Promise<ArtifactSourceReference | undefined> => {
  return applyExport(artifact.definitionReference || {}, exportArtifactSourceReference, artifact.definitionReference?.project.id)
}

const defaultVersionType = async (definitionRef: { [key: string]: ArtifactSourceReference }): Promise<ArtifactSourceReference | undefined> => {
  const exported = applyExport(definitionRef.defaultVersionType || {}, exportDefaultVersionType)
  return Object.keys(exported).length !== 0 ? exported : undefined
}

const definitionReferenceDefinition = async (definitionRef: { [key: string]: ArtifactSourceReference }, projectId: string): Promise<{ [key: string]: string }> => {
  const buildDefinition = await buildApi.findBuildDefinitionById(Number(definitionRef.definition.id), projectId)
  return { name: buildDefinition.name!, path: buildDefinition.path! }
}

const description = async (releaseDefinition: ReleaseDefinition): Promise<string | undefined> => {
  return releaseDefinition.description ? releaseDefinition.description : undefined
}

const environments = async (releaseDefinition: ReleaseDefinition, projectId: string): Promise<ReleaseDefinitionEnvironment[] | undefined> => {
  return Promise.all(
    (releaseDefinition.environments || [])
      .map(environment => applyExport(environment, exportEnvironment, projectId))
  )
}

const properties = async (releaseDefinition: ReleaseDefinition | ReleaseDefinitionEnvironment): Promise<any> => {
  return Object.keys(releaseDefinition.properties).length !== 0 ? releaseDefinition.properties : undefined
}

const tags = async (releaseDefinition: ReleaseDefinition): Promise<string[] | undefined> => {
  return (releaseDefinition.tags || []).length !== 0 ? releaseDefinition.tags : undefined
}

const triggers = async (releaseDefinition: ReleaseDefinition): Promise<ReleaseTriggerBase[] | undefined> => {
  return (releaseDefinition.triggers || []).length !== 0 ? releaseDefinition.triggers : undefined
}

const variableGroups = async (releaseDefinition: ReleaseDefinition | ReleaseDefinitionEnvironment, projectId: string): Promise<string[] | undefined> => {
  const vars = await Promise.all(
    (releaseDefinition.variableGroups || [])
      .map(async variable => {
        const variableGroup = await variableGroupApi.findVariableGroupById(variable, projectId)
        return variableGroup.name!
      })
  )
  return vars.length !== 0 ? vars : undefined
}

const variables = async (releaseDefinition: ReleaseDefinition | ReleaseDefinitionEnvironment): Promise<{ [key: string]: ConfigurationVariableValue } | { [key: string]: string | undefined } | undefined> => {
  const vars =
    (await Promise.all(
      Object.entries(releaseDefinition.variables || {})
        .map(async ([name, value]) => {
          const exported = await applyExport(value, exportVariable)
          if (Object.keys(exported).length === 1 && exported.hasOwnProperty('value')) {
            return { [name]: value.value }
          }
          return { [name]: value }
        })
    )).reduce((previousValue, currentValue) => Object.assign({}, previousValue, currentValue), {})
  return vars.length !== 0 ? vars : undefined
}

const exportReleaseDefinition: ReleaseDefinition | object = {
  _links: filterProp,
  artifacts,
  createdBy: filterProp,
  createdOn: filterProp,
  description,
  environments,
  id: filterProp,
  isDeleted: filterProp,
  modifiedBy: filterProp,
  modifiedOn: filterProp,
  path: '\\',
  projectReference: filterProp,
  properties,
  releaseNameFormat: '',
  revision: filterProp,
  source: filterProp,
  tags,
  triggers,
  url: filterProp,
  variables,
  variableGroups,
}

const exportArtifact: Artifact = {}

const exportBuildArtifact: Artifact | object = {
  sourceId: filterProp,
  definitionReference,
  isPrimary: false,
  isRetained: false,
}

const exportArtifactSourceReference: ArtifactSourceReference | object = {
  artifactSourceDefinitionUrl: filterProp,
  defaultVersionType,
  definition: definitionReferenceDefinition,
  project: filterProp,
}

const exportDefaultVersionType: ArtifactSourceReference = {
  id: 'latestType',
  name: 'Latest',
}

const exportEnvironment: ReleaseDefinitionEnvironment | object = {
  badgeUrl: filterProp,
  currentRelease: filterProp,
  deployStep: filterProp,
  id: filterProp,
  owner: filterProp,
  properties,
  rank: filterProp,
  variables,
  variableGroups,
  // TODO complete
}

const exportVariable: ConfigurationVariableValue = {
  allowOverride: false,
  isSecret: false,
}

export { exportReleaseDefinition }

