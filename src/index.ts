import { Command } from 'commander'
import log from 'loglevel'
import bootstrapAzureDevOps from './azure-devops/bootstrap'
import apply from './core/actions/apply'
import _delete from './core/actions/delete'
import get from './core/actions/get'
import test from './core/actions/test'
import bootstrapCore from './core/bootstrap'
import { initialize as initializeConfig } from './core/config'
import { addCommands, multiple } from './core/util/commander'
import { initializeLogging } from './core/util/logging'

initializeLogging()
initializeConfig()

const program = new Command()
addCommands(
  program
    .command('apply')
    .requiredOption('-f, --filename <fileOption>', 'File name to apply.', multiple)
    .option('-R, --recursive', 'recursively if directory')
    .option('--dry-run', 'todo')
    .option('-l, --selector <selector>', 'todo')
    .option('-n, --namespace <namespace>', 'todo')
    .option('-o, --output <output>', 'todo')
    .action(apply),
  program
    .command('delete')
    .requiredOption('-f, --filename <fileOption>', 'File name to apply.', multiple)
    .option('-R, --recursive', 'recursively if directory')
    .option('--dry-run', 'todo')
    .option('-l, --selector <selector>', 'todo')
    .option('-n, --namespace <namespace>', 'todo')
    .option('-o, --output <output>', 'todo')
    .action(_delete),
  program
    .command('get <kind> [name]')
    .option('-l, --selector <selector>', 'todo')
    .option('-n, --namespace <namespace>', 'todo')
    .option('-o, --output <output>', 'todo')
    .option('--export', 'todo')
    .action(get),
  program
    .command('test')
    .action(test)
)

bootstrapCore()
bootstrapAzureDevOps(program)

program
  .parseAsync(process.argv)
  .catch((e: Error) => {
    log.error('ERROR 👎')
    log.error(e/*.message*/)
  })


