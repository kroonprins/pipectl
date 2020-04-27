import { registerCommand } from '@kroonprins/pipectl/dist/util/yargs'
import { Argv } from 'yargs'
import abandonPullRequest from './actions/abandon-pull-request'
import completePullRequest from './actions/complete-pull-request'

export default (yargs: Argv) => {
  registerCommand(
    yargs.command(
      'abandon-pull-request <id>',
      'todo',
      (yarg) => {
        yarg.positional('id', { type: 'string', description: 'todo' })
      },
      abandonPullRequest
    ),
    yargs.command(
      'complete-pull-request <id>',
      'todo',
      (yarg) => {
        yarg.positional('id', { type: 'string', description: 'todo' })
      },
      completePullRequest
    )
  )
}
