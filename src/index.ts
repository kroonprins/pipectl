import { Command } from 'commander'
import apply from './actions/apply'
import _delete from './actions/delete'
import { multiple } from './util/commander'
import { initialize as initializeAuthConfig } from './auth'

initializeAuthConfig()

const program = new Command()
program
    .command('apply')
    .requiredOption('-f, --filename <fileOption>', 'File name to apply.', multiple)
    .option('-R, --recursive', 'recursively if directory')
    .option('--dry-run', 'todo')
    .option('-l, --selector <selector>', 'todo')
    .action(apply)

program
    .command('delete')
    .requiredOption('-f, --filename <fileOption>', 'File name to apply.', multiple)
    .option('-R, --recursive', 'recursively if directory')
    .option('--dry-run', 'todo')
    .option('-l, --selector <selector>', 'todo')
    .action(_delete)

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


