import { Command } from 'commander'
import { updateLogLevel } from './logging'

function multiple(value: string, previous: string[] = []) {
  return previous.concat([value])
}

function addCommands(...commands: Command[]) {
  for (const command of commands) {
    command
      .option('--log-level <logLevel>', 'todo')
      .addListener('option:log-level', updateLogLevel)
  }
}

export { multiple, addCommands }
