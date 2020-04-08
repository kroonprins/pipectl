
const applyDefaults = async <T>(source: T, defaults: T | object, ...extraFunctionArgs: any[]): Promise<T> => {
  const result: any = Object.assign({}, source)

  for (const [key, value] of Object.entries(defaults)) {
    if (value instanceof Function) {
      result[key] = await value(source, ...extraFunctionArgs)
    } else if (!result.hasOwnProperty(key)) {
      result[key] = value
    }
  }

  return result
}

export { applyDefaults }

