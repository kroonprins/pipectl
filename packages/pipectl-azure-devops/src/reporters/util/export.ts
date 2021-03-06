import { $enum } from 'ts-enum-util'

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
      if (!isEmpty(updatedValue)) {
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
  ).filter((item) => !isEmpty(item))
}

const isEmpty = (value: any): boolean => {
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

const filterIfEmpty = <T, K extends keyof T>(source: T, key: K) => {
  return source[key]
}

const filterArrayIfEquals = (testArray: (string | number)[]) => {
  return <
    T extends { [key: string]: (string | number)[] | undefined },
    K extends keyof T
  >(
    source: T,
    key: K
  ) => {
    const sourceArray = source[key]
    if (!sourceArray || sourceArray.length !== testArray.length) {
      return sourceArray
    }
    for (const [index, item] of sourceArray.entries()) {
      if (item !== testArray[index]) {
        return sourceArray
      }
    }
    return
  }
}

const object = <T extends { [key: string]: U }, U, V extends keyof T>(
  descriptor: U | object
): ((
  source: T | undefined,
  key: V,
  ...extraFunctionArgs: any[]
) => Promise<U>) => (
  source: T | undefined,
  key: V,
  ...extraFunctionArgs: any[]
) =>
  applyExport(
    source ? source[key] : undefined,
    descriptor,
    ...extraFunctionArgs
  )

const array = <T extends { [key: string]: U[] }, U, V extends keyof T>(
  descriptor: U | object
): ((
  source: T | undefined,
  key: V,
  ...extraFunctionArgs: any[]
) => Promise<U[]>) => (
  source: T | undefined,
  key: V,
  ...extraFunctionArgs: any[]
) =>
  applyExportOnArray(
    source ? source[key] : undefined,
    descriptor,
    ...extraFunctionArgs
  )

const enumValue = <E extends Record<Extract<keyof E, string>, number | string>>(
  enumType: E,
  defaultValue: number | string | undefined
) => {
  return <T extends { [key: string]: number | string }, K extends keyof T>(
    source: T,
    key: K
  ) => {
    if (source[key] === defaultValue) {
      return undefined
    }
    return $enum(enumType).getKeyOrThrow(source[key])
  }
}

const translateEnumValue = <
  E extends Record<Extract<keyof E, string>, number | string>
>(
  enumType: E
) => {
  return <T extends { [key: string]: number | string }, K extends keyof T>(
    source: T,
    key: K
  ) => {
    return $enum(enumType).getKeyOrThrow(source[key])
  }
}

export {
  applyExport,
  applyExportOnArray,
  filterProp,
  filterIfEmpty,
  filterArrayIfEquals,
  object,
  array,
  enumValue,
  translateEnumValue,
}
