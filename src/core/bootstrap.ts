import { DuplicateFilter } from "./filters/DuplicateFilter"
import { SelectorFilter } from "./filters/SelectorFilter"
import { registerFallbackReporter, registerFilter } from "./registration"
import { FallbackReporter } from "./reporter"

export default () => {
  registerFilter(new SelectorFilter())
  registerFilter(new DuplicateFilter())

  registerFallbackReporter(new FallbackReporter())
}
