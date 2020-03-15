import log from "loglevel"

export default async (arg1: any, arg2: any, arg3: any) => {
  log.info(`arg1: ${arg1}`)
  log.info(`arg2: ${arg2}`)
  log.info(`arg3: ${arg3}`)
  // const api = await buildApi.getApi()
  // const response = await api.addDefinitionTag("Webfoundation", 823, "testTag")
  // log.info(`response: ${JSON.stringify(response)}`)
  // const response2 = await api.getDefinitionTags("Webfoundation", 823)
  // log.info(`response: ${JSON.stringify(response2)}`)
}
