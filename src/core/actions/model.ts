interface CommonArguments {
  filename?: string[]
  recursive?: boolean,
  selector?: string,
  namespace?: string
}

interface ApplyArguments extends CommonArguments {
  filename: string[],
  dryRun?: boolean
}

interface GetArguments extends CommonArguments {
  kind: string,
  name?: string // number for azure devops
}

enum Action {
  APPLY = "apply",
  DELETE = "delete",
  GET = "get"
}

export {
  CommonArguments,
  ApplyArguments,
  GetArguments,
  Action
}
