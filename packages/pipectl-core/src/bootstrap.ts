import { Command } from 'commander'
import apply from './actions/apply'
import _delete from './actions/delete'
import get from './actions/get'
import { DuplicateFilter } from './filters/DuplicateFilter'
import { SelectorFilter } from './filters/SelectorFilter'
import { registerFallbackReporter, registerFilter } from './registration'
import { FallbackReporter } from './reporter'
import { multiple, registerCommand } from './util/commander'

type BootstrapFunction = (command: Command) => void

const bootstrapCore: BootstrapFunction = (program: Command) => {
  registerCommand(
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

  registerFilter(
    new SelectorFilter(),
    new DuplicateFilter()
  )

  registerFallbackReporter(
    new FallbackReporter()
  )
}

export { BootstrapFunction, bootstrapCore }

