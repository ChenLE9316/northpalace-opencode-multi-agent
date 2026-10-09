#!/usr/bin/env node
// Minimal V2 Client. Explicitly NOT a DAG scheduler or production queue.
import { OpenCode } from "@opencode/client"
import { resolve } from "node:path"
import { load, save } from "./state.mjs"

const [cmd, ...args] = process.argv.slice(2)
const baseUrl = process.env.OPENCODE_URL ?? "http://127.0.0.1:4096"
const location = resolve(process.env.NP_WORKSPACE ?? process.cwd())
const headers = process.env.OPENCODE_TOKEN
  ? { authorization: "Bearer " + process.env.OPENCODE_TOKEN }
  : undefined
const client = OpenCode.make({ baseUrl, headers })
const out = (data) => console.log(JSON.stringify(data, null, 2))
function usage() {
  console.log("Usage: node cli.mjs start <goal> | send <sessionID> <message> | status | watch")
}

try {
  if (cmd === "start") {
    const goal = args.join(" ").trim()
    if (!goal) throw Error("missing goal")
    const session = await client.session.create({ location: { directory: location } })
    // V2 session may have a separate model selection; role does not impose a model.
    await client.session.switchAgent({ sessionID: session.id, agent: "NorthPalac" })
    const data = await load()
    data.sessions.push({ id: session.id, agent: "NorthPalac", goal, createdAt: new Date().toISOString() })
    await save(data)
    out({ sessionID: session.id, state: "created", location })
    await client.session.prompt({ sessionID: session.id, text: goal })
    out({ sessionID: session.id, state: "prompt-submitted" })
  } else if (cmd === "send") {
    const [sessionID, ...message] = args
    if (!sessionID || !message.length) throw Error("usage: send <sessionID> <message>")
    await client.session.prompt({ sessionID, text: message.join(" ") })
    out({ sessionID, state: "prompt-submitted" })
  } else if (cmd === "status") {
    const data = await load()
    for (const row of data.sessions) {
      try {
        const session = await client.session.get({ sessionID: row.id })
        out({ local: row, remote: session })
      } catch (e) {
        out({ local: row, error: String(e) })
      }
    }
  } else if (cmd === "watch") {
    // Live-only events: reconnect on failure; business events missed during
    // reconnection MUST be reconciled with API snapshots in future phases.
    for (;;) {
      try {
        for await (const event of client.event.subscribe()) out(event)
        console.error("event stream ended; reconnecting")
      } catch (e) {
        console.error("event stream failed:", String(e))
      }
      await new Promise((done) => setTimeout(done, 2000))
    }
  } else {
    usage()
    process.exitCode = 1
  }
} catch (e) {
  console.error(String(e))
  process.exitCode = 1
}
