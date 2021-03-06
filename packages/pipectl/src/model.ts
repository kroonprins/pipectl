import { Action, CommonArguments } from './actions/model'

interface Resource {
  apiVersion: string
  kind: string
}

interface Definition extends Resource {
  metadata: MetaData
  spec: object
}

interface Labels {
  [key: string]: string
}

interface MetaData {
  namespace: string
  labels?: Labels // TODO add them also as tags in azure devops?
  // TODO annotations?
}

interface DefinitionGroupItem {
  name: string
  definitions: Definition[]
}

interface DefinitionGroup {
  items: DefinitionGroupItem[]
}

interface DefinitionGrouper {
  canGroup(
    definition: Definition,
    action: Action,
    args: CommonArguments
  ): boolean
  group(
    definition: Definition,
    action: Action,
    args: CommonArguments
  ): [string, string[]]
}

interface UniqueId {
  uniqueId(): string
}

interface TransformedDefinition extends UniqueId {
  sourceDefinition: Definition

  shortName(): string
}

interface DefinitionTransformer {
  canTransform(
    definition: Definition,
    action: Action,
    args: CommonArguments
  ): boolean
  transform(
    definition: Definition,
    action: Action,
    args: CommonArguments
  ): Promise<TransformedDefinition>
}

interface DefinitionPreFilter {
  canFilter(
    transformedDefinition: TransformedDefinition,
    transformedDefinitions: TransformedDefinition[],
    action: Action,
    args: CommonArguments
  ): boolean
  filter(
    transformedDefinition: TransformedDefinition,
    transformedDefinitions: TransformedDefinition[],
    action: Action,
    args: CommonArguments
  ): boolean
}

interface DefinitionPostFilter {
  canFilter(
    definition: Definition,
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: CommonArguments
  ): boolean
  filter(
    definition: Definition,
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: CommonArguments
  ): boolean
}

interface ActionProcessor {
  canProcess(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: CommonArguments
  ): boolean
  process(
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: CommonArguments
  ): Promise<ProcessResult>
}

class ProcessResult {
  public error?: Error
  public info?: string
  public results?: Definition[]
  public properties?: { [key: string]: string }
}

interface Reporter {
  canReport(
    processResult: ProcessResult,
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: CommonArguments
  ): boolean
  report(
    processResult: ProcessResult,
    transformedDefinition: TransformedDefinition,
    action: Action,
    args: CommonArguments
  ): Promise<void>
}

export {
  Resource,
  Definition,
  DefinitionPreFilter,
  DefinitionPostFilter,
  DefinitionGrouper,
  DefinitionGroup,
  DefinitionGroupItem,
  TransformedDefinition,
  DefinitionTransformer,
  ActionProcessor,
  ProcessResult,
  Reporter,
}
