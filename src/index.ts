import { Command } from 'commander'
import bootstrapAzureDevOps from './azure-devops/bootstrap'
import apply from './core/actions/apply'
import _delete from './core/actions/delete'
import get from './core/actions/get'
import { initialize as initializeConfig } from './core/config'
import { multiple } from './core/util/commander'

initializeConfig()
bootstrapAzureDevOps()

const program = new Command()
program
  .command('apply')
  .requiredOption('-f, --filename <fileOption>', 'File name to apply.', multiple)
  .option('-R, --recursive', 'recursively if directory')
  .option('--dry-run', 'todo')
  .option('-l, --selector <selector>', 'todo')
  .option('-n, --namespace <namespace>', 'todo')
  .option('-o, --output <output>', 'todo')
  .action(apply)

program
  .command('delete')
  .requiredOption('-f, --filename <fileOption>', 'File name to apply.', multiple)
  .option('-R, --recursive', 'recursively if directory')
  .option('--dry-run', 'todo')
  .option('-l, --selector <selector>', 'todo')
  .option('-n, --namespace <namespace>', 'todo')
  .option('-o, --output <output>', 'todo')
  .action(_delete)

program
  .command('get <kind> [name]')
  // .option('-f, --filename <fileOption>', 'todo.', multiple) // TODO
  // .option('-R, --recursive', 'recursively if directory')
  .option('-l, --selector <selector>', 'todo')
  .option('-n, --namespace <namespace>', 'todo')
  .option('-o, --output <output>', 'todo')
  .option('--export', 'todo')
  .action(get)

program
  .parseAsync(process.argv)
  // .then(() => {
  //     console.log()
  //     console.log('Adios 👍')
  // })
  .catch((e: Error) => {
    /* tslint:disable:no-console */ // TODO
    console.log("ERROR 👎")
    console.log(e/*.message*/)
  })


