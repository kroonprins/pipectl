#!/usr/bin/env node

import * as dotenv from 'dotenv'
import yargs from 'yargs'
import { bootstrapCore, BootstrapFunction } from './bootstrap'
import { currentPlugins, initialize as initializeConfig } from './config'
import { initializeLogging, log } from './util/logging'

const main = async () => {
  try {
    dotenv.config()

    yargs.showHelpOnFail(false)
    const argv = yargs.options({
      pipeconfig: { type: 'string' },
      logLevel: { type: 'string', alias: 'log-level' },
    }).argv

    initializeLogging(argv.logLevel)
    initializeConfig(argv.pipeconfig)

    bootstrapCore(yargs)

    await Promise.all(
      currentPlugins().map(async (plugin) => {
        const bootstrapFunctionPlugin = ((
          await import(`${plugin}/dist/bootstrap`)
        ).default as unknown) as BootstrapFunction
        return bootstrapFunctionPlugin(yargs)
      })
    )

    yargs.argv /* tslint:disable-line:no-unused-expression */
  } catch (e) {
    log.error('ERROR 👎')
    log.error(e /*.message*/)
  }
}

main()
