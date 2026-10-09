import test from "node:test"
import assert from "node:assert/strict"
import { VALID, transition } from "../state.mjs"

test("all required statuses exist", () => {
  for (const name of ["queued","assigned","running","review","accepted","integrated","blocked","failed","cancelled","changes_requested"])
    assert.ok(VALID.has(name))
})
test("valid task progression", () => {
  assert.equal(transition("queued","assigned"),"assigned")
  assert.equal(transition("assigned","running"),"running")
  assert.equal(transition("running","review"),"review")
  assert.equal(transition("review","accepted"),"accepted")
  assert.equal(transition("accepted","integrated"),"integrated")
})
test("reject invalid transitions", () => {
  assert.throws(() => transition("queued","integrated"))
  assert.throws(() => transition("integrated","running"))
  assert.throws(() => transition("blocked","integrated"))
})
