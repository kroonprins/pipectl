import log, { LogLevelDesc } from 'loglevel'

const initializeLogging = (logLevel?: string) => {
  log.setDefaultLevel(logLevel ? (logLevel as LogLevelDesc) : 'info') // TODO validate input
}

export { initializeLogging, log }
