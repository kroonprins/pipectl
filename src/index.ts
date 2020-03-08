import { Command } from 'commander'
import apply from './actions/apply'
import _delete from './actions/delete'
import get from './actions/get'
import { multiple } from './util/commander'
import { initialize as initializeConfig } from './config'

initializeConfig()

const program = new Command()
program
    .command('apply')
    .requiredOption('-f, --filename <fileOption>', 'File name to apply.', multiple)
    .option('-R, --recursive', 'recursively if directory')
    .option('--dry-run', 'todo')
    .option('-l, --selector <selector>', 'todo')
    .option('-n, --namespace <namespace>', 'todo')
    .action(apply)

program
    .command('delete')
    .requiredOption('-f, --filename <fileOption>', 'File name to apply.', multiple)
    .option('-R, --recursive', 'recursively if directory')
    .option('--dry-run', 'todo')
    .option('-l, --selector <selector>', 'todo')
    .option('-n, --namespace <namespace>', 'todo')
    .action(_delete)


program
    .command('get <kind> [name]')
    //.option('-f, --filename <fileOption>', 'todo.', multiple) // TODO
    //.option('-R, --recursive', 'recursively if directory')
    .option('-l, --selector <selector>', 'todo')
    .option('-n, --namespace <namespace>', 'todo')
    .action(get)    

program
    .parseAsync(process.argv)
    .then(() => {
        console.log()
        console.log('Adios 👍')
    })
    .catch((e: Error) => {
        console.log("ERROR 👎")
        console.log(e/*.message*/)
    })


