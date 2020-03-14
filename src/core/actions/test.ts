import { buildApi } from "../../azure-devops/adapters/build-api"

/* tslint:disable:no-console */
export default async () => {
  const api = await buildApi.getApi()
  const response = await api.addDefinitionTag("Webfoundation", 823, "testTag")
  console.log(`response: ${JSON.stringify(response)}`)
  const response2 = await api.getDefinitionTags("Webfoundation", 823)
  console.log(`response: ${JSON.stringify(response2)}`)
}
