#!/usr/bin/env node

import { Command } from 'commander'
import { bootstrapCore, BootstrapFunction } from 'pipectl-core/dist/bootstrap'
import { currentPlugins, initialize as initializeConfig } from 'pipectl-core/dist/config'
import { initializeLogging, log } from 'pipectl-core/dist/util/logging'

(async () => {
  try {
    initializeLogging()
    initializeConfig()

    const program = new Command()

    bootstrapCore(program)

    await Promise.all(
      currentPlugins().map(async (plugin) => {
        const bootstrapFunction = ((await import(`${plugin}/dist/bootstrap`)).default as unknown) as BootstrapFunction
        return bootstrapFunction(program)
      })
    )

    await program.parseAsync(process.argv)
  } catch (e) {
    log.error('ERROR 👎')
    log.error(e/*.message*/)
  }

})()

