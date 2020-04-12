const applyExport = async <T>(source: T, descriptor: T | object, ...extraFunctionArgs: any[]): Promise<T> => {
  const result: any = Object.assign({}, source)

  for (const [key, value] of Object.entries(descriptor)) {
    if (!result.hasOwnProperty(key)) {
      continue
    }
    let updatedValue: any
    if (value instanceof Function) {
      updatedValue = await value(source, ...extraFunctionArgs)
      if (updatedValue !== undefined && result[key] !== updatedValue) {
        result[key] = updatedValue
      } else {
        delete result[key]
      }
    } else {
      if (result[key] === value) {
        delete result[key]
      }
    }
  }

  return result
}

const filterProp = () => {
  return undefined
}

export { applyExport, filterProp }

