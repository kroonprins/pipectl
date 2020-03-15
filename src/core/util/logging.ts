import log, { LogLevelDesc } from 'loglevel'

const initializeLogging = () => {
  log.setDefaultLevel('info')
}

const updateLogLevel = (logLevel: LogLevelDesc) => {
  // TODO validate input
  log.setLevel(logLevel)
}

export { initializeLogging, updateLogLevel }

