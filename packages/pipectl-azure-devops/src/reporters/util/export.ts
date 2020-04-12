const applyExport = async <T>(source: T, descriptor: T | object, ...extraFunctionArgs: any[]): Promise<T> => {
  const result: any = Object.assign({}, source)

  for (const [key, value] of Object.entries(descriptor)) {
    let updatedValue: any = undefined
    if (value instanceof Function) {
      updatedValue = await value(source, ...extraFunctionArgs)
    } else if (!result.hasOwnProperty(key)) {
      updatedValue = value
    }
    if (updatedValue && result[key] !== updatedValue) {
      result[key] = updatedValue
    } else {
      delete result[key]
    }
  }

  return result
}

const filterProp = () => {
  return undefined
}

export { applyExport, filterProp }

