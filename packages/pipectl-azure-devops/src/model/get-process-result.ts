import { ProcessResult } from 'pipectl-core/dist/model'

class GetProcessResult<T> extends ProcessResult {
  constructor(public results?: T[]) { super() }
}

export { GetProcessResult }

