const toLabels = (tags: string[] | undefined): { [key: string]: string } =>
  (tags || []).reduce((p, v) => {
    const [key, value] = v.split('=')
    p[key] = value
    return p
  }, {} as any)

const toTags = (labels: { [key: string]: string } | undefined): string[] => {
  return Object.entries(labels || {}).map(([k, v]) => `${k}=${v}`)
}

export { toLabels, toTags }
