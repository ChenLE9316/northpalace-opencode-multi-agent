import {Buffer} from "node:buffer"

export function clientHeaders(env=process.env){
  if(env.OPENCODE_TOKEN)return {authorization:`Bearer ${env.OPENCODE_TOKEN}`}
  if(!env.OPENCODE_PASSWORD)return {}
  const username=env.OPENCODE_SERVER_USERNAME||"opencode"
  const encoded=Buffer.from(`${username}:${env.OPENCODE_PASSWORD}`,"utf8").toString("base64")
  return {authorization:`Basic ${encoded}`}
}

export function clientOptions(env=process.env){
  const baseUrl=env.OPENCODE_URL||"http://127.0.0.1:4096"
  let url
  try{url=new URL(baseUrl)}
  catch{throw Error("OPENCODE_URL must be a valid HTTP or HTTPS URL")}
  if(!["http:","https:"].includes(url.protocol))throw Error("OPENCODE_URL must use HTTP or HTTPS")
  if(url.username||url.password)throw Error("OPENCODE_URL must not contain credentials; configure the auth environment variables")
  const secretQuery=/^(?:token|access[_-]?token|password|secret|api[_-]?key|authorization)$/i
  if([...url.searchParams.keys()].some(key=>secretQuery.test(key)))
    throw Error("OPENCODE_URL must not carry credentials in query parameters")
  const host=url.hostname.toLowerCase().replace(/^\[|\]$/g,"")
  const loopback=["localhost","127.0.0.1","::1"].includes(host)
  const hasCredentials=Boolean(env.OPENCODE_TOKEN||env.OPENCODE_PASSWORD)
  if(hasCredentials&&url.protocol!=="https:"&&!loopback)
    throw Error("Refusing to send OpenCode credentials over non-TLS HTTP; use HTTPS or a loopback URL")
  return {baseUrl,headers:clientHeaders(env)}
}
