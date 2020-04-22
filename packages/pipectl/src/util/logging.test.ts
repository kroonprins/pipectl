import { initializeLogging, log } from './logging'

describe('logging', () => {
  test('initializeLogging should set given level', () => {
    initializeLogging('warn')
    expect(log.getLevel()).toBe(3)
  })

  test('initializeLogging should set info if no level given', () => {
    initializeLogging()
    expect(log.getLevel()).toBe(2)
  })
})
