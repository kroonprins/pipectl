#!/usr/bin/env node

import { bootstrapCore, BootstrapFunction } from '@kroonprins/pipectl-core/dist/bootstrap'
import { currentPlugins, initialize as initializeConfig } from '@kroonprins/pipectl-core/dist/config'
import { initializeLogging, log } from '@kroonprins/pipectl-core/dist/util/logging'
import yargs from 'yargs'

(async () => {
  try {
    const argv = yargs.options({
      pipeconfig: { type: 'string' },
      logLevel: { type: 'string', alias: 'log-level' },
    }).argv

    initializeLogging(argv.logLevel)
    initializeConfig(argv.pipeconfig)

    bootstrapCore(yargs)

    await Promise.all(
      currentPlugins().map(async (plugin) => {
        const bootstrapFunctionPlugin = ((await import(`${plugin}/dist/bootstrap`)).default as unknown) as BootstrapFunction
        return bootstrapFunctionPlugin(yargs)
      })
    )

    yargs.argv /* tslint:disable-line:no-unused-expression */
  } catch (e) {
    log.error('ERROR 👎')
    log.error(e/*.message*/)
  }

})()

