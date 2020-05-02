const toLabels = (tags: string[] | undefined): { [key: string]: string } =>
  (tags || []).reduce((p, v) => {
    const [key, value] = v.split('=')
    p[key] = value
    return p
  }, {} as any)

export { toLabels }
