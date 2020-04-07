import { Command } from 'commander'
import apply from 'pipectl-core/src/actions/apply'
import _delete from 'pipectl-core/src/actions/delete'
import get from 'pipectl-core/src/actions/get'
import { bootstrapCore, BootstrapFunction } from 'pipectl-core/src/bootstrap'
import { currentPlugins, initialize as initializeConfig } from 'pipectl-core/src/config'
import { addCommands, multiple } from 'pipectl-core/src/util/commander'
import { initializeLogging, log } from 'pipectl-core/src/util/logging'

(async () => {
  try {
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
        .action(get)
    )

    bootstrapCore(program)

    await Promise.all(
      currentPlugins().map(async (plugin) => {
        const bootstrapFunction = ((await import(`${plugin}/src/bootstrap`)).default as unknown) as BootstrapFunction
        return bootstrapFunction(program)
      })
    )

    await program.parseAsync(process.argv)
  } catch (e) {
    log.error('ERROR 👎')
    log.error(e/*.message*/)
  }

})()

