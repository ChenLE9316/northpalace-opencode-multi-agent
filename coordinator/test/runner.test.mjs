import test from "node:test"
import assert from "node:assert/strict"
import {mkdtemp,mkdir,rm} from "node:fs/promises"
import {tmpdir} from "node:os"
import {join} from "node:path"
import {Runner} from "../runner.mjs"
const fake=()=>({
  model:{list:async()=>({data:[{providerID:"lmstudio",modelID:"mock",capabilities:{tools:true}}]})},
  session:{create:async()=>({id:"ses_mock"}),prompt:async()=>({ok:true}),get:async()=>({id:"ses_mock"})}
})
async function fixture(fn){
 const base=await mkdtemp(join(tmpdir(),"np-"))
 const ws=join(base,"repository"),wt=join(base,"worktrees")
 await mkdir(ws);await mkdir(wt)
 try{return await fn({ws,wt,base})}finally{await rm(base,{force:true,recursive:true})}
}
test("dispatch admits once and preserves session evidence",()=>fixture(async({ws,wt,base})=>{
 const runner=new Runner({client:fake(),workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"test",goal:"Implement test task",acceptance:["verified"]})
 const first=await runner.dispatch()
 assert.equal(first.state,"running")
 assert.equal(first.task.sessionID,"ses_mock")
 assert.equal((await runner.dispatch()).state,"empty")
 const observed=await runner.reconcile()
 assert.equal(observed[0].activity,"session-present")
}))
test("ambiguous delivery is blocked, never automatically retried",()=>fixture(async({ws,wt,base})=>{
 const client=fake()
 client.session.prompt=async()=>{throw Error("timeout")}
 const runner=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"test",goal:"Implement test task",acceptance:["verified"]})
 const first=await runner.dispatch()
 assert.equal(first.state,"blocked")
 assert.equal((await runner.dispatch()).state,"empty")
 assert.equal((await runner.list())[0].sessionID,"ses_mock")
}))
test("reject unknown worktree location",()=>fixture(async({ws,wt,base})=>{
 const runner=new Runner({client:fake(),workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await assert.rejects(runner.add({id:"test",goal:"Implement test task",worktree:join(base,"private"),acceptance:["verified"]}))
}))
