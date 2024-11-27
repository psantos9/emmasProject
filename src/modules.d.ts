// We extend process.env with two additional variables
// LEANIX_HOST = workspace instance, e.g. "app.leanix.net"
// LEANIX_APITOKEN = workspace api token

declare namespace NodeJS {
  export interface ProcessEnv {
    LEANIX_HOST: string
    LEANIX_APITOKEN: string
    LEANIX_WORKSPACE_ID: string
    LEANIX_ACCOUNT_ID: string
  }
}
