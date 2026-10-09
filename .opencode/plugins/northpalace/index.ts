import { randomUUID } from "node:crypto"
import { Plugin } from "@opencode/plugin"

// Shared, durable advisory peer mailbox. No automatic wake-up or identity authentication.
// OpenCode V2 plugin storage is authoritative for these messages; task registry is separate.
type Mail = {
  id: string
  recipient: string
  sender: string
  threadId: string
  taskId: string
  kind: string
  body: string
  createdAt: string
  ackedBy?: string
  ackedAt?: string
}

const input = (properties: Record<string, unknown>, required: string[]) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
})
const string = { type: "string", minLength: 1, maxLength: 8000 }

export default Plugin.define({
  id: "northpalace-mailbox",
  async setup(ctx) {
    await ctx.tool.transform((editor) => {
      editor.namespace({
        name: "northpalace",
        description: "Advisory cross-session messages for NorthPalace agents",
      })
      editor.add({
        name: "send",
        description: "Send a concise advisory message to a session:<id> or role:<id> mailbox.",
        input: input({
          recipient: string, sender: string, taskId: string, threadId: string,
          kind: { type: "string", enum: ["request","progress","handoff","blocker","reply"] },
          body: string,
        }, ["recipient","sender","taskId","threadId","kind","body"]),
        options: { namespace: "northpalace", codemode: true },
        execute: async (raw) => {
          const data = raw as Omit<Mail,"id"|"createdAt">
          if (!/^(session|role):[^\s]{1,200}$/.test(data.recipient))
            return { content: "Invalid recipient: expected session:<id> or role:<id>" }
          const item: Mail = { ...data, id: randomUUID(), createdAt: new Date().toISOString() }
          await ctx.storage.set("message/" + item.id, item)
          return { content: JSON.stringify({ ok: true, id: item.id, delivery: "mailbox-pull-only" }) }
        },
      })
      editor.add({
        name: "inbox",
        description: "List recent unacknowledged messages addressed to one exact session/role mailbox.",
        input: input({
          recipient: string,
          limit: { type: "integer", minimum: 1, maximum: 50 },
          includeAcknowledged: { type: "boolean" },
        }, ["recipient"]),
        options: { namespace: "northpalace", codemode: true },
        execute: async (raw) => {
          const args = raw as { recipient: string; limit?: number; includeAcknowledged?: boolean }
          const messages: Mail[] = []
          let after: string | undefined = undefined
          // Defensive upper bound: scan at most 2000 entries per request.
          for (let page = 0; page < 20; page++) {
            const data = await ctx.storage.scan({ prefix: "message/", after, limit: 100 })
            for (const entry of data.entries) {
              const message = entry.value as Mail
              if (message.recipient === args.recipient && (args.includeAcknowledged || !message.ackedAt))
                messages.push(message)
            }
            if (!data.next) break
            after = data.next
          }
          messages.sort((a,b) => a.createdAt.localeCompare(b.createdAt))
          return { content: JSON.stringify({ recipient: args.recipient,
            messages: messages.slice(0,args.limit ?? 25),
            notice: "advisory pull mailbox; no guaranteed immediate delivery" }) }
        },
      })
      editor.add({
        name: "ack",
        description: "Acknowledge one mailbox message already processed by the receiver.",
        input: input({ id: string, receiver: string }, ["id","receiver"]),
        options: { namespace: "northpalace", codemode: true },
        execute: async (raw) => {
          const args = raw as { id: string; receiver: string }
          const key = "message/" + args.id
          const original = await ctx.storage.get(key) as Mail | undefined
          if (!original) return { content: JSON.stringify({ ok: false, reason: "not_found" }) }
          if (original.recipient !== args.receiver)
            return { content: JSON.stringify({ ok: false, reason: "recipient_mismatch" }) }
          if (!original.ackedAt) await ctx.storage.set(key, {
            ...original, ackedAt: new Date().toISOString(), ackedBy: args.receiver,
          })
          return { content: JSON.stringify({ ok: true, id: args.id }) }
        },
      })
    })
  },
})
