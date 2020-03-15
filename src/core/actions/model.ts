interface CommonArguments {
  filename?: string[]
  recursive?: boolean,
  selector?: string,
  namespace?: string,
  output?: 'yaml' | 'json'
}

interface ApplyArguments extends CommonArguments {
  filename: string[],
  dryRun?: boolean
}

interface GetArguments extends CommonArguments {
  kind: string,
  name?: string, // number for azure devops
  export?: boolean
}

enum Action {
  APPLY = 'apply',
  DELETE = 'delete',
  GET = 'get'
}

// tslint:disable-next-line: semicolon // TODO why does visual studio code insist on the semicolon :'(
export { CommonArguments, ApplyArguments, GetArguments, Action };

