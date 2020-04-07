import { Command } from 'commander'
import { DuplicateFilter } from './filters/DuplicateFilter'
import { SelectorFilter } from './filters/SelectorFilter'
import { registerFallbackReporter, registerFilter } from './registration'
import { FallbackReporter } from './reporter'

type BootstrapFunction = (command: Command) => void

const bootstrapCore: BootstrapFunction = (_command: Command) => {
  registerFilter(new SelectorFilter())
  registerFilter(new DuplicateFilter())

  registerFallbackReporter(new FallbackReporter())
}

export { BootstrapFunction, bootstrapCore }

