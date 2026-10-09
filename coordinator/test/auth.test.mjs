import test from "node:test"
import assert from "node:assert/strict"
import {clientHeaders,clientOptions} from "../auth.mjs"

test("uses bearer token when configured",()=>{
 assert.deepEqual(clientHeaders({OPENCODE_TOKEN:"test-token"}),{authorization:"Bearer test-token"})
})

test("uses OpenCode Basic Auth with the default username",()=>{
 const headers=clientHeaders({OPENCODE_PASSWORD:"test-password"})
 assert.equal(headers.authorization,"Basic "+Buffer.from("opencode:test-password").toString("base64"))
})

test("supports an explicitly configured server username",()=>{
 const headers=clientHeaders({OPENCODE_PASSWORD:"test-password",OPENCODE_SERVER_USERNAME:"local-user"})
 assert.equal(headers.authorization,"Basic "+Buffer.from("local-user:test-password").toString("base64"))
})

test("returns no auth header when no credential is configured",()=>{
 assert.deepEqual(clientHeaders({}),{})
})

test("allows authentication to HTTPS and loopback servers",()=>{
 assert.equal(clientOptions({OPENCODE_URL:"https://opencode.example.test",OPENCODE_PASSWORD:"test-password"}).baseUrl,"https://opencode.example.test")
 assert.equal(clientOptions({OPENCODE_URL:"http://127.0.0.1:4096",OPENCODE_TOKEN:"test-token"}).baseUrl,"http://127.0.0.1:4096")
})

test("refuses credentials over non-loopback HTTP",()=>{
 assert.throws(()=>clientOptions({OPENCODE_URL:"http://192.0.2.10:4096",OPENCODE_PASSWORD:"test-password"}),/non-TLS HTTP/)
 assert.throws(()=>clientOptions({OPENCODE_URL:"http://opencode.example.test",OPENCODE_TOKEN:"test-token"}),/non-TLS HTTP/)
})

test("rejects credentials embedded in the server URL",()=>{
 const embedded=new URL("http://localhost:4096")
 embedded.username="test-user"
 embedded.password="test-password"
 assert.throws(()=>clientOptions({OPENCODE_URL:embedded.href}),/must not contain credentials/)
 assert.throws(()=>clientOptions({OPENCODE_URL:"https://opencode.example.test/?token=dummy"}),/must not carry credentials/)
})
