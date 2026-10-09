import { readFile, writeFile, mkdir, rename } from "node:fs/promises"
import { join, dirname } from "node:path"

const dir = process.env.NP_STATE_DIR || join(process.cwd(), ".northpalace-state")
const file = join(dir, "sessions.json")
export const VALID = new Set(["queued","assigned","running","review","accepted","integrated","blocked","failed","cancelled","changes_requested"])
export function transition(current, next) {
  const transitions = {
    queued: ["assigned", "cancelled"],
    assigned: ["running", "blocked", "cancelled"],
    running: ["review", "blocked", "failed", "cancelled"],
    review: ["accepted", "changes_requested", "blocked"],
    changes_requested: ["assigned", "cancelled"],
    accepted: ["integrated", "blocked"],
    blocked: ["assigned", "cancelled"],
    failed: ["assigned", "cancelled"],
    cancelled: [], integrated: [],
  }
  if (!VALID.has(current) || !VALID.has(next) || !transitions[current].includes(next))
    throw new Error("invalid task transition: " + current + " -> " + next)
  return next
}
export async function load() {
  try { return JSON.parse(await readFile(file, "utf8")) }
  catch (e) { if (e.code === "ENOENT") return { sessions: [] }; throw e }
}
export async function save(data) {
  await mkdir(dirname(file), { recursive: true })
  const tmp = file + "." + process.pid + ".tmp"
  await writeFile(tmp, JSON.stringify(data, null, 2) + "\n", { flag: "w" })
  await rename(tmp, file)
}
