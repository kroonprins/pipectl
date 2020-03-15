import { ApplyArguments, CommonArguments, GetArguments } from './model'

const stringifyApplyArguments = (args: ApplyArguments) => {
  return `dryRun[${args.dryRun}], ${stringifyCommonArguments(args)}`
}

const stringifyGetArguments = (args: GetArguments) => {
  return `kind[${args.kind}], name[${args.name}], export[${args.export}], ${stringifyCommonArguments(args)}`
}

const stringifyCommonArguments = (args: CommonArguments) => {
  return `filename[${args.filename}], recursive[${args.recursive}], selector[${args.selector}], namespace[${args.namespace}], output[${args.output}]`
}

export { stringifyApplyArguments, stringifyGetArguments }

