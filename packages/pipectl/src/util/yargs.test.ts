import { registerCommand } from './yargs'

describe('registerCommand', () => {
  test('should always return undefined', () => {
    expect(registerCommand()).toBeUndefined()
  })
})
