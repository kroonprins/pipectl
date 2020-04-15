import { ProcessResult } from '@kroonprins/pipectl/dist/model'

class GetProcessResult<T> extends ProcessResult {
  constructor(public results?: T[]) {
    super()
  }
}

export { GetProcessResult }
