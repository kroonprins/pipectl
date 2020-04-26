import { $enum } from 'ts-enum-util'

const applyDefaults = async <T>(
  source: T,
  defaults: T | object,
  ...extraFunctionArgs: any[]
): Promise<T> => {
  const result: any = Object.assign({}, source)

  for (const [key, value] of Object.entries(defaults)) {
    if (value instanceof Function) {
      result[key] = await value(source, key, ...extraFunctionArgs)
    } else if (!result.hasOwnProperty(key)) {
      result[key] = value
    }
  }

  return result
}

const enumValue = <E extends Record<Extract<keyof E, string>, number | string>>(
  enumType: E,
  defaultValue: number | string
) => {
  return <T extends { [key: string]: number | string }, K extends keyof T>(
    source: T,
    key: K
  ) => {
    if (!source.hasOwnProperty(key)) {
      return defaultValue
    }
    if (source[key] === defaultValue) {
      return defaultValue
    }
    if (Number(source[key])) {
      return source[key]
    }
    return $enum(enumType).getValueOrThrow(source[key] as string)
  }
}

export { applyDefaults, enumValue }
