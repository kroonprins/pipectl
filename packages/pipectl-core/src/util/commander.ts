import { Command } from 'commander'
import { updateLogLevel } from './logging'

function multiple(value: string, previous: string[] = []) {
  return previous.concat([value])
}

function registerCommand(...commands: Command[]) {
  for (const command of commands) {
    command
      .option('--log-level <logLevel>', 'todo')
      .addListener('option:log-level', updateLogLevel)
    command
      .option('--pipeconfig <configFile>', 'todo')
  }
}

export { multiple, registerCommand }

