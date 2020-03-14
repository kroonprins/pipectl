import { registerFallbackReporter, registerFallbackSelector } from "./registration"
import { FallbackReporter } from "./reporter"
import { DefaultSelector } from "./selector"

export default () => {
  registerFallbackSelector(new DefaultSelector())
  registerFallbackReporter(new FallbackReporter())
}
