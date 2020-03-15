import { Command } from "commander"
import log from "loglevel"

function multiple(value: string, previous: string[] = []) {
  return previous.concat([value])
}

function addCommands(...commands: Command[]) {
  for (const command of commands) {
    command
      .option('--log-level <logLevel>', 'todo')
      .addListener('option:log-level', (logLevel) => {
        log.setLevel(logLevel)
      })
  }
}

export { multiple, addCommands }

