import { registerCommand } from '@kroonprins/pipectl/dist/util/yargs'
import { Argv } from 'yargs'
import abandonPullRequest from './actions/abandon-pull-request'

export default (yargs: Argv) => {
  registerCommand(
    yargs.command(
      'abandon-pull-request <id>',
      'todo',
      (yarg) => {
        yarg.positional('id', { type: 'string', description: 'todo' })
      },
      abandonPullRequest
    )
  )
}
