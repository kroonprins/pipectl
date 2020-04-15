import { Argv } from 'yargs'
import apply from './actions/apply'
import _delete from './actions/delete'
import get from './actions/get'
import { DuplicateFilter } from './filters/DuplicateFilter'
import { SelectorFilter } from './filters/SelectorFilter'
import { registerFallbackReporter, registerFilter } from './registration'
import { FallbackReporter } from './reporter'
import { registerCommand } from './util/yargs'

type BootstrapFunction = (yargs: Argv) => void

const bootstrapCore: BootstrapFunction = (yargs: Argv) => {
  registerCommand(
    yargs.command(
      'apply',
      'todo',
      (yarg) => {
        yarg
          .options({
            filename: {
              type: 'string',
              array: true,
              alias: 'f',
              description: 'todo',
            },
            dryRun: { type: 'boolean', description: 'todo' },
            recursive: { type: 'boolean', alias: 'R', description: 'todo' },
            selector: { type: 'string', alias: 'l', description: 'todo' }, // TODO array?
            namespace: { type: 'string', alias: 'n', description: 'todo' },
            output: {
              type: 'string',
              alias: 'o',
              description: 'todo',
              choices: ['yaml', 'json'],
            },
          })
          .demandOption('filename')
      },
      apply
    ),
    yargs.command(
      'delete',
      'todo',
      (yarg) => {
        yarg
          .options({
            filename: {
              type: 'string',
              array: true,
              alias: 'f',
              description: 'todo',
            },
            dryRun: { type: 'boolean', description: 'todo' },
            recursive: { type: 'boolean', alias: 'R', description: 'todo' },
            selector: { type: 'string', alias: 'l', description: 'todo' }, // TODO array?
            namespace: { type: 'string', alias: 'n', description: 'todo' },
            output: {
              type: 'string',
              alias: 'o',
              description: 'todo',
              choices: ['yaml', 'json'],
            },
          })
          .demandOption('filename')
      },
      _delete
    ),
    yargs.command(
      'get <kind> [name]',
      'todo',
      (yarg) => {
        yarg
          .positional('kind', { type: 'string', description: 'todo' })
          .positional('name', { type: 'string', description: 'todo' })
          .options({
            selector: { type: 'string', alias: 'l', description: 'todo' }, // TODO array?
            namespace: { type: 'string', alias: 'n', description: 'todo' },
            output: {
              type: 'string',
              alias: 'o',
              description: 'todo',
              choices: ['yaml', 'json'],
            },
            export: { type: 'boolean', description: 'todo' },
          })
      },
      get
    )
  )

  registerFilter(new SelectorFilter(), new DuplicateFilter())

  registerFallbackReporter(new FallbackReporter())
}

export { BootstrapFunction, bootstrapCore }
