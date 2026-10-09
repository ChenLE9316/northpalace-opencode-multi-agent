import test from "node:test"
import assert from "node:assert/strict"
import {mkdtemp,mkdir,rm} from "node:fs/promises"
import {join} from "node:path"
import {fileURLToPath} from "node:url"
import {Runner} from "../runner.mjs"
const tempRoot=fileURLToPath(new URL("../../runtime/test-tmp/",import.meta.url))
const fake=()=>({
  model:{list:async()=>({data:[{providerID:"lmstudio",modelID:"mock",capabilities:{tools:true}}]})},
  session:{create:async()=>({id:"ses_mock"}),prompt:async()=>({ok:true}),get:async()=>({id:"ses_mock"}),remove:async()=>({ok:true})}
})
async function fixture(fn){
 await mkdir(tempRoot,{recursive:true})
 const base=await mkdtemp(join(tempRoot,"np-"))
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

test("blocked session cannot be cancelled without explicit interrupted evidence",()=>fixture(async({ws,wt,base})=>{
 const c=fake();c.session.prompt=async()=>{throw Error("ambiguous network timeout")}
 const runner=new Runner({client:c,workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"guard",goal:"Implement safe task",acceptance:["verified"]})
 await runner.dispatch()
 await assert.rejects(runner.mark("guard","cancelled","ignore ambiguous session"))
 const status=(await runner.list()).find(t=>t.id==="guard")
 assert.equal(status.status,"blocked")
}))

test("task registry survives a Coordinator restart",()=>fixture(async({ws,wt,base})=>{
 const stateDir=join(base,"state")
 const first=new Runner({client:fake(),workspace:ws,worktreeRoot:wt,stateDir,env:{}})
 await first.add({id:"persisted",goal:"survive a Coordinator restart",acceptance:["task is readable"]})
 const restarted=new Runner({client:fake(),workspace:ws,worktreeRoot:wt,stateDir,env:{}})
 const tasks=await restarted.list()
 assert.equal(tasks.length,1)
 assert.equal(tasks[0].id,"persisted")
 assert.equal(tasks[0].status,"queued")
}))

test("concurrent dispatches reserve only one writer per worktree",()=>fixture(async({ws,wt,base})=>{
 const stateDir=join(base,"state"),client=fake()
 const first=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir,env:{}})
 const second=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir,env:{}})
 await first.add({id:"writer-one",goal:"write in the shared worktree",acceptance:["one writer runs"]})
 await first.add({id:"writer-two",goal:"also write in the shared worktree",acceptance:["writer is serialized"]})
 await Promise.all([first.dispatch(),second.dispatch()])
 const tasks=await first.list()
 assert.equal(tasks.filter(task=>task.status==="running").length,1)
 assert.equal(tasks.filter(task=>task.status==="queued").length,1)
}))

test("ambiguous task can be requeued only after interruption is confirmed",()=>fixture(async({ws,wt,base})=>{
 const client=fake();let created=0
 client.session.create=async()=>({id:`ses_${++created}`})
 client.session.prompt=async({sessionID})=>{
  if(sessionID==="ses_1")throw Error("ambiguous timeout")
  return {ok:true}
 }
 const runner=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"retry",goal:"retry after verified interruption",acceptance:["second session runs"]})
 assert.equal((await runner.dispatch()).state,"blocked")
 await assert.rejects(runner.mark("retry","queued","retry without evidence"),/confirmed-interrupted/)
 await runner.mark("retry","queued","confirmed-interrupted: previous session was interrupted")
 const retried=await runner.dispatch()
 assert.equal(retried.state,"running")
 assert.equal(retried.task.sessionID,"ses_2")
}))

test("failed tasks can be marked and re-dispatched with interruption evidence",()=>fixture(async({ws,wt,base})=>{
 const client=fake();let created=0
 client.session.create=async()=>({id:`ses_${++created}`})
 const runner=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"failed-retry",goal:"retry an observed failed task",acceptance:["second session runs"]})
 assert.equal((await runner.dispatch()).state,"running")
 await runner.mark("failed-retry","failed","provider returned a terminal error")
 await assert.rejects(runner.mark("failed-retry","queued","retry now"),/confirmed-interrupted/)
 await runner.mark("failed-retry","queued","confirmed-interrupted: failed session has stopped")
 const retried=await runner.dispatch()
 assert.equal(retried.state,"running")
 assert.equal(retried.task.sessionID,"ses_2")
}))

test("ambiguous session.create failure without an ID requires interruption evidence",()=>fixture(async({ws,wt,base})=>{
 const client=fake();client.session.create=async()=>{throw Error("transport timeout after request")}
 const runner=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"create-timeout",goal:"recover an ambiguous session create",acceptance:["retry is gated"]})
 assert.equal((await runner.dispatch()).state,"blocked")
 const task=(await runner.list())[0]
 assert.equal(task.sessionID,null)
 assert.equal(task.sessionUnknown,true)
 await assert.rejects(runner.mark("create-timeout","queued","retry now"),/confirmed-interrupted/)
 await runner.mark("create-timeout","queued","confirmed-interrupted: checked server for the ambiguous create")
 const requeued=(await runner.list())[0]
 assert.equal(requeued.sessionUnknown,false)
 assert.equal(requeued.sessionID,null)
}))

test("session.create response without an ID remains ambiguous",()=>fixture(async({ws,wt,base})=>{
 const client=fake();client.session.create=async()=>({})
 const runner=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"missing-session-id",goal:"handle a missing session ID",acceptance:["no duplicate dispatch"]})
 assert.equal((await runner.dispatch()).state,"blocked")
 const task=(await runner.list())[0]
 assert.equal(task.sessionID,null)
 assert.equal(task.sessionUnknown,true)
 await assert.rejects(runner.mark("missing-session-id","cancelled","cancel without checking"),/confirmed-interrupted/)
}))

test("legacy registry tasks without sessionUnknown are recovered conservatively",()=>fixture(async({ws,wt,base})=>{
 const runner=new Runner({client:fake(),workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"legacy-blocked",goal:"recover an older ambiguous task",acceptance:["retry requires confirmation"]})
 await runner.state.transaction(state=>{
  const task=state.tasks[0]
  task.status="blocked";task.sessionID=null;task.activity="unknown-session"
  delete task.sessionUnknown
 })
 await assert.rejects(runner.mark("legacy-blocked","queued","retry without interruption evidence"),/confirmed-interrupted/)
 assert.equal((await runner.list())[0].sessionUnknown,true)
}))

test("cancellation is gated while session.create is in flight",()=>fixture(async({ws,wt,base})=>{
 const client=fake();let signalStarted,resolveCreate
 const started=new Promise(resolve=>{signalStarted=resolve})
 client.session.create=()=>{signalStarted();return new Promise(resolve=>{resolveCreate=resolve})}
 const runner=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"create-pending",goal:"protect an in-flight session create",acceptance:["no cancellation race"]})
 const dispatching=runner.dispatch()
 await started
 assert.equal((await runner.list())[0].sessionUnknown,true)
 await assert.rejects(runner.mark("create-pending","cancelled","cancel while create is pending"),/confirmed-interrupted/)
 assert.equal((await runner.reconcile())[0].activity,"session-create-pending")
 resolveCreate({id:"ses_after_pending"})
 assert.equal((await dispatching).state,"running")
}))

test("legacy assigned task with a false uncertainty flag is gated",()=>fixture(async({ws,wt,base})=>{
 const runner=new Runner({client:fake(),workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"legacy-assigned",goal:"protect an old assigned task",acceptance:["cancellation requires confirmation"]})
 await runner.state.transaction(state=>{
  const task=state.tasks[0]
  task.status="assigned";task.sessionID=null;task.sessionUnknown=false
 })
 await assert.rejects(runner.mark("legacy-assigned","cancelled","cancel old task without checking"),/confirmed-interrupted/)
 assert.equal((await runner.list())[0].sessionUnknown,true)
}))

test("confirmed cancellation during create skips prompt and removes the new session",()=>fixture(async({ws,wt,base})=>{
 const client=fake();let signalStarted,resolveCreate,promptCount=0,removed=[]
 const started=new Promise(resolve=>{signalStarted=resolve})
 client.session.create=()=>{signalStarted();return new Promise(resolve=>{resolveCreate=resolve})}
 client.session.prompt=async()=>{promptCount++;return {ok:true}}
 client.session.remove=async({sessionID})=>{removed.push(sessionID)}
 const runner=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"cancel-create",goal:"stop before sending the prompt",acceptance:["cancelled launch never starts"]})
 const dispatching=runner.dispatch()
 await started
 await runner.mark("cancel-create","cancelled","confirmed-interrupted: verified no prompt was sent")
 resolveCreate({id:"ses_cancelled_create"})
 const result=await dispatching
 assert.equal(result.state,"cancelled")
 assert.equal(promptCount,0)
 assert.deepEqual(removed,["ses_cancelled_create"])
 assert.equal((await runner.list())[0].activity,"cancelled-before-prompt")
}))

test("task status cannot change while session.prompt is being admitted",()=>fixture(async({ws,wt,base})=>{
 const client=fake();let signalStarted,resolvePrompt
 const started=new Promise(resolve=>{signalStarted=resolve})
 client.session.prompt=()=>{signalStarted();return new Promise(resolve=>{resolvePrompt=resolve})}
 const runner=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"prompt-pending",goal:"protect an in-flight prompt",acceptance:["prompt has one status owner"]})
 const dispatching=runner.dispatch()
 await started
 await assert.rejects(runner.mark("prompt-pending","cancelled","confirmed-interrupted: cancel prompt"),/session.prompt is in progress/)
 assert.equal((await runner.reconcile())[0].activity,"prompt-admission-pending")
 resolvePrompt({ok:true})
 assert.equal((await dispatching).state,"running")
}))

test("reconcile cannot overwrite activity changed while session.get is pending",()=>fixture(async({ws,wt,base})=>{
 const client=fake();let signalStarted,resolveGet
 const started=new Promise(resolve=>{signalStarted=resolve})
 client.session.get=()=>{signalStarted();return new Promise(resolve=>{resolveGet=resolve})}
 const runner=new Runner({client,workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"reconcile-race",goal:"preserve newer prompt activity",acceptance:["stale reconcile is ignored"]})
 await runner.state.transaction(state=>{
  const task=state.tasks[0]
  task.status="assigned";task.sessionID="ses_reconcile_race";task.sessionUnknown=false;task.activity="session-created"
 })
 const reconciling=runner.reconcile()
 await started
 await runner.state.transaction(state=>{state.tasks[0].activity="prompting"})
 resolveGet({id:"ses_reconcile_race"})
 await reconciling
 assert.equal((await runner.list())[0].activity,"prompting")
 await assert.rejects(runner.mark("reconcile-race","cancelled","confirmed-interrupted: test prompt guard"),/session.prompt is in progress/)
}))

test("stale prompt admission has an evidence-gated operator recovery path",()=>fixture(async({ws,wt,base})=>{
 const runner=new Runner({client:fake(),workspace:ws,worktreeRoot:wt,stateDir:join(base,"state"),env:{}})
 await runner.add({id:"stale-prompt",goal:"recover a stale prompt admission",acceptance:["recovery keeps interruption evidence"]})
 await runner.state.transaction(state=>{
  const task=state.tasks[0]
  task.status="assigned";task.sessionID="ses_stale_prompt";task.sessionUnknown=false;task.activity="prompting"
 })
 await assert.rejects(runner.mark("stale-prompt","blocked","recovery without confirmation"),/session.prompt is in progress/)
 await runner.mark("stale-prompt","blocked","confirmed-interrupted: checked server and stopped the stale prompt")
 await runner.mark("stale-prompt","queued","confirmed-interrupted: verified old Session is stopped")
 const recovered=(await runner.list())[0]
 assert.equal(recovered.status,"queued")
 assert.equal(recovered.sessionID,null)
}))
