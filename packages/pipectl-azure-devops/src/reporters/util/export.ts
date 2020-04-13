const applyExport = async <T>(
  source: T | undefined,
  descriptor: T | object,
  ...extraFunctionArgs: any[]
): Promise<T> => {
  const result: any = Object.assign({}, source)

  for (const [key, value] of Object.entries(descriptor)) {
    if (!result.hasOwnProperty(key)) {
      continue
    }
    let updatedValue: any
    if (value instanceof Function) {
      updatedValue = await value(source, key, ...extraFunctionArgs)
      if (!empty(updatedValue)) {
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

const applyExportOnArray = async <T>(
  source: T[] | undefined,
  descriptor: T | object,
  ...extraFunctionArgs: any[]
): Promise<T[]> => {
  return (
    await Promise.all(
      (source || []).map((item) =>
        applyExport(item, descriptor, ...extraFunctionArgs)
      )
    )
  ).filter((item) => !empty(item))
}

const empty = (value: any): boolean => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim() === '')
  )
}

const filterProp = () => {
  return undefined
}

const filterIfEmpty = (source: any, key: string) => {
  return source[key]
}

export { applyExport, applyExportOnArray, filterProp, filterIfEmpty }
