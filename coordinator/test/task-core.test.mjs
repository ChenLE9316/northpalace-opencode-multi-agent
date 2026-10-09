import test from "node:test"
import assert from "node:assert/strict"
import {normalizeTask,changeStatus,isReady,canAssign,canonicalLocation} from "../task-core.mjs"
const ws=process.cwd(),root=ws+"/../northpalace-worktrees"
const newTask=(id,changes={})=>normalizeTask({id,goal:"implement correct feature",acceptance:["tests pass"],...changes},[],ws)
test("task schema validates scope and acceptance",()=>{
  assert.throws(()=>normalizeTask({id:"x",goal:"ok"},[],ws))
  assert.throws(()=>newTask("../escape"))
  assert.equal(newTask("one").status,"queued")
})
test("task IDs must be unique within the registry",()=>{
  const first=newTask("duplicate")
  assert.throws(()=>normalizeTask({id:"duplicate",goal:"another feature",acceptance:["tests pass"]},[first],ws),/duplicate task ID/)
})
test("dependency state unlocks only when integrated",()=>{
  const a=newTask("first"),b=normalizeTask({id:"second",goal:"run dependent step",acceptance:["reviewed"],dependsOn:["first"]},[a],ws)
  assert.equal(isReady(b,[a,b]),false)
  for(const status of ["assigned","running","review","accepted","integrated"])changeStatus(a,status)
  assert.equal(isReady(b,[a,b]),true)
})
test("writer lock does not block read-only and lane quota",()=>{
  const a=newTask("a"),b=newTask("b"),r=newTask("r",{write:false})
  a.model={lane:"local"};changeStatus(a,"assigned")
  assert.equal(canAssign(b,[a,b],{local:2,cloud:1},"local").reason,"writer_conflict")
  assert.equal(canAssign(r,[a,r],{local:2,cloud:1},"local").ok,true)
  assert.equal(canAssign(r,[a,r],{local:1,cloud:1},"local").reason,"lane_capacity")
})
test("location rejects arbitrary sibling paths",()=>{
  assert.equal(canonicalLocation(ws,ws,root),ws)
  assert.throws(()=>canonicalLocation(ws+"/../other-repo",ws,root))
})
