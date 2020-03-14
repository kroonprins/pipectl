import { ActionProcessor, DefinitionGrouper, DefinitionSelector, DefinitionTransformer, Reporter } from "./model"

class Registrations<T> {
  private _registrations: T[] = []
  private _fallbackRegistration: T | undefined

  register(...r: T[]): void {
    this._registrations.push(...r)
  }
  registerFallback(r: T): void {
    this._fallbackRegistration = r
  }

  get(): readonly T[] {
    if (this._fallbackRegistration) {
      return Object.freeze([...this._registrations, this._fallbackRegistration])
    }
    return Object.freeze([...this._registrations])
  }
}

const _selectors = new Registrations<DefinitionSelector>()
const registerSelector = (...s: DefinitionSelector[]): void => {
  _selectors.register(...s)
}
const registerFallbackSelector = (s: DefinitionSelector): void => {
  _selectors.registerFallback(s)
}
const selectors = (): readonly DefinitionSelector[] => {
  return _selectors.get()
}

const _groupers = new Registrations<DefinitionGrouper>()
const registerGrouper = (...g: DefinitionGrouper[]): void => {
  _groupers.register(...g)
}
const registerFallbackGrouper = (g: DefinitionGrouper): void => {
  _groupers.registerFallback(g)
}
const groupers = (): readonly DefinitionGrouper[] => {
  return _groupers.get()
}

const _transformers = new Registrations<DefinitionTransformer>()
const registerTransformer = (...t: DefinitionTransformer[]): void => {
  _transformers.register(...t)
}
const registerFallbackTransformer = (t: DefinitionTransformer): void => {
  _transformers.registerFallback(t)
}
const transformers = (): readonly DefinitionTransformer[] => {
  return _transformers.get()
}

const _actionProcessors = new Registrations<ActionProcessor>()
const registerActionProcessor = (...p: ActionProcessor[]): void => {
  _actionProcessors.register(...p)
}
const registerFallbackActionProcessor = (p: ActionProcessor): void => {
  _actionProcessors.registerFallback(p)
}
const processors = (): readonly ActionProcessor[] => {
  return _actionProcessors.get()
}

const _reporters = new Registrations<Reporter>()
const registerReporter = (...r: Reporter[]): void => {
  _reporters.register(...r)
}
const registerFallbackReporter = (r: Reporter): void => {
  _reporters.registerFallback(r)
}
const reporters = (): readonly Reporter[] => {
  return _reporters.get()
}

export { registerSelector, registerFallbackSelector, selectors, registerGrouper, registerFallbackGrouper, groupers, registerTransformer, registerFallbackTransformer, transformers, registerActionProcessor, registerFallbackActionProcessor, processors, registerReporter, registerFallbackReporter, reporters }

