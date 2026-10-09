#!/usr/bin/env node
// OpenCode V2 Client + durable, locally serialized NorthPalace task registry.
import { OpenCode } from "@opencode/client"
import {resolve,join} from "node:path"
import {readFile} from "node:fs/promises"
import {Runner} from "./runner.mjs"
import {publicModels,modelOptions,limits} from "./hybrid.mjs"

const [cmd,...args]=process.argv.slice(2)
const root=resolve(process.env.NP_WORKSPACE||process.cwd())
const runtime=resolve(process.env.NP_STATE_DIR||join(root,"runtime","state","northpalace"))
const worktrees=resolve(process.env.NP_WORKTREE_ROOT||join(root,"..","northpalace-worktrees"))
const token=process.env.OPENCODE_TOKEN
const client=OpenCode.make({
  baseUrl:process.env.OPENCODE_URL||"http://127.0.0.1:4096",
  ...(token?{headers:{authorization:"Bearer "+token}}:{})
})
const runner=new Runner({client,workspace:root,worktreeRoot:worktrees,stateDir:runtime})
const out=(x)=>console.log(JSON.stringify(x,null,2))
const usage=()=>{
  console.log("Usage: node coordinator/cli.mjs <command> [args]")
  console.log(" add <task-json-file> | dispatch | reconcile | tasks | mark <taskID> <status> <reason> | models | doctor | watch")
}
async function run(){
  if(cmd==="add"){
    if(args.length!==1)throw Error("provide task JSON file path")
    const input=JSON.parse(await readFile(resolve(args[0]),"utf8"))
    return out(await runner.add(input))
  }
  if(cmd==="dispatch")return out(await runner.dispatch())
  if(cmd==="reconcile")return out(await runner.reconcile())
  if(cmd==="tasks")return out(await runner.list())
  if(cmd==="mark"){
    const [taskId,status,...parts]=args
    return out(await runner.mark(taskId,status,parts.join(" ")))
  }
  if(cmd==="models")return out(publicModels(await client.model.list({location:{directory:root}})))
  if(cmd==="doctor"){
    const modelList=publicModels(await client.model.list({location:{directory:root}}))
    const plugins=await client.plugin.list({location:{directory:root}})
    const agents=await client.agent.list({location:{directory:root}})
    return out({workspace:root,stateDir:runtime,worktreeRoot:worktrees,
      hybrid:{...modelOptions(),limits:limits()},models:modelList,
      plugins:plugins.data??plugins,agents:(agents.data??agents).map(a=>({id:a.id||a.name,mode:a.mode}))})
  }
  if(cmd==="watch"){
    // Observability only. No auto-task completion; always 'reconcile' after reconnect.
    for(;;){
      try{
        await runner.reconcile()
        for await(const event of client.event.subscribe()){
          out({receivedAt:new Date().toISOString(),event})
        }
      }catch(e){console.error("event connection ended:",String(e))}
      await new Promise(resolve=>setTimeout(resolve,2000))
    }
  }
  usage();process.exitCode=1
}
run().catch(e=>{console.error("ERROR:",String(e));process.exitCode=1})
