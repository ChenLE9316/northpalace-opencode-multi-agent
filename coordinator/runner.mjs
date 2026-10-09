import {existsSync,realpathSync,statSync} from "node:fs"
import {resolve} from "node:path"
import {Store,log} from "./task-store.mjs"
import {normalizeTask,changeStatus,canonicalLocation,canAssign,BUSY,newId} from "./task-core.mjs"
import {selectModel,readModels,modelOptions,limits} from "./hybrid.mjs"

export const unwrap=(data)=>data?.data??data
export class Runner {
  constructor({client,workspace,worktreeRoot,stateDir,env=process.env}){
    this.client=client;this.workspace=resolve(workspace);this.worktreeRoot=resolve(worktreeRoot)
    this.state=new Store(stateDir);this.env=env
  }
  checkLocation(input){
    const location=canonicalLocation(input,this.workspace,this.worktreeRoot)
    if(!existsSync(location)||!statSync(location).isDirectory())throw Error("worktree directory not found: "+location)
    const physical=realpathSync(location)
    const physicalMain=realpathSync(this.workspace)
    // Reject links/junctions that redirect a task outside the intended location.
    if(physical!==location && !(process.platform==="win32"&&physical.toLowerCase()===location.toLowerCase()))throw Error("worktree junction/symlink path rejected")
    if(location===this.workspace && physical!==physicalMain)throw Error("main checkout path changed")
    return location
  }
  async add(input){
    return this.state.transaction(state=>{
      const task=normalizeTask(input,state.tasks,this.workspace)
      task.worktree=this.checkLocation(task.worktree)
      state.tasks.push(task);log(state,"created",task.id,{dependencies:task.dependsOn})
      return task
    })
  }
  async list(){return (await this.state.read()).tasks}
  async mark(taskId,status,note){
    if(!note?.trim())throw Error("evidence/reason is required")
    return this.state.transaction(state=>{
      const t=state.tasks.find(t=>t.id===taskId)
      if(!t)throw Error("task not found")
      if(t.status==="assigned" && t.activity==="prompting" && !(status==="blocked" && note.startsWith("confirmed-interrupted:")))
        throw Error("session.prompt is in progress; wait for dispatch to finish, or confirm interruption before blocking it")
      // Never allow arbitrary accept/complete from an inactive session.
      if(!["queued","review","accepted","integrated","blocked","failed","cancelled","changes_requested"].includes(status))
        throw Error("unsupported operator transition")
      if(status==="cancelled" && (t.sessionID || t.sessionUnknown) && !note.startsWith("confirmed-interrupted:"))
        throw Error("task has a session; interrupt/check it manually, then supply reason beginning 'confirmed-interrupted:'")
      if(status==="queued" && (t.sessionID || t.sessionUnknown) && !note.startsWith("confirmed-interrupted:"))
        throw Error("task has a session; verify interruption before requeueing and start the note with 'confirmed-interrupted:'")
      if(status==="queued"){
        t.sessionID=null
        t.sessionUnknown=false
        t.activity="unstarted"
      }
      changeStatus(t,status,note)
      log(state,"transition",taskId,{status,note})
      return t
    })
  }
  async dispatch(){
    const snapshot=await this.state.read()
    const candidates=snapshot.tasks.filter(t=>t.status==="queued"||t.status==="changes_requested")
    if(!candidates.length)return {state:"empty"}
    const catalog=readModels(await this.client.model.list({location:{directory:this.workspace}}))
    const opts=modelOptions(this.env),caps=limits(this.env)
    const errors=[]
    for(const candidate of candidates){
      if(candidate.status==="changes_requested")continue  // operator must explicitly requeue
      let choice
      try{choice=selectModel(catalog,{...opts,lane:candidate.lane})}
      catch(e){errors.push({taskId:candidate.id,reason:String(e)});continue}
      let reserved
      try{
        reserved=await this.state.transaction(state=>{
          const t=state.tasks.find(x=>x.id===candidate.id)
          if(!t || t.status!=="queued")return null
          const result=canAssign(t,state.tasks,caps,choice.lane)
          if(!result.ok)return null
          this.checkLocation(t.worktree)
          t.model=choice
          // Persist the non-idempotent launch boundary before the API call so
          // another CLI process cannot cancel/requeue while create is in flight.
          t.sessionUnknown=true
          t.activity="creating-session"
          changeStatus(t,"assigned","reserved workspace and model lane")
          log(state,"reserved",t.id,{lane:choice.lane,worktree:t.worktree})
          return {...t}
        })
      }catch(e){errors.push({taskId:candidate.id,reason:String(e)});continue}
      if(!reserved)continue
      try{
        const {lane,...model}=choice
        const response=unwrap(await this.client.session.create({
          location:{directory:reserved.worktree},
          agent:"NorthPalac",
          model,
          title:"NorthPalace "+reserved.id
        }))
        if(!response?.id)throw Error("session.create returned no id; manual reconciliation required")
        await this.state.transaction(state=>{
          const t=state.tasks.find(t=>t.id===reserved.id)
          t.sessionID=response.id
          t.sessionUnknown=false
          t.activity="session-created"
          state.sessions.push({id:response.id,taskId:t.id,createdAt:new Date().toISOString()})
          log(state,"session-created",t.id,{sessionID:response.id})
        })
        const promptAllowed=await this.state.transaction(state=>{
          const t=state.tasks.find(t=>t.id===reserved.id)
          if(t.status!=="assigned"){
            log(state,"prompt-skipped",t.id,{sessionID:response.id,status:t.status})
            return false
          }
          t.activity="prompting"
          log(state,"prompt-started",t.id,{sessionID:response.id})
          return true
        })
        if(!promptAllowed){
          let cleanupError=null
          try{await this.client.session.remove({sessionID:response.id})}
          catch(e){cleanupError=String(e)}
          return await this.state.transaction(state=>{
            const t=state.tasks.find(t=>t.id===reserved.id)
            t.activity=cleanupError?"pre-prompt-cleanup-failed":t.status==="cancelled"?"cancelled-before-prompt":"stopped-before-prompt"
            if(cleanupError)t.error="Session created after task stopped; cleanup failed: "+cleanupError
            log(state,cleanupError?"session-cleanup-failed":"session-removed-before-prompt",t.id,{sessionID:response.id,error:cleanupError})
            return {state:t.status,task:t,cleanupError}
          })
        }
        const request=[
          "NorthPalace task contract ID: "+reserved.id,
          "Goal: "+reserved.goal,
          "Worktree: "+reserved.worktree,
          "Dependencies integrated: "+reserved.dependsOn.join(", "),
          "Acceptance criteria:\n"+reserved.acceptance.map(x=>"- "+x).join("\n"),
          "Act autonomously within this task's location. Use subagents as needed. Return verifiable evidence.",
          "Do not change unrelated branches, push or publish. Do not claim accepted/integrated on your own."
        ].join("\n\n")
        // This request has non-idempotent side effects; never automatically retry after transport error.
        await this.client.session.prompt({sessionID:response.id,text:request})
        return await this.state.transaction(state=>{
          const t=state.tasks.find(t=>t.id===reserved.id)
          changeStatus(t,"running","prompt admitted by server")
          t.activity="prompt-admitted"
          log(state,"prompt-admitted",t.id,{sessionID:t.sessionID})
          return {state:"running",task:t}
        })
      }catch(e){
        return await this.state.transaction(state=>{
          const t=state.tasks.find(t=>t.id===reserved.id)
          const error=String(e)
          if(t.status==="assigned")changeStatus(t,"blocked","Ambiguous launch or delivery; inspect server before requeue: "+error)
          else t.error="Launch result failed after task moved to "+t.status+": "+error
          if(!t.sessionID){
            t.sessionUnknown=true
            t.activity="unknown-session"
          }else if(t.status==="blocked")t.activity="prompt-ambiguous"
          t.error=t.error||error
          log(state,"dispatch-blocked",t.id,{error:t.error})
          return {state:t.status,task:t,error}
        })
      }
    }
    return {state:"no-ready-task",errors}
  }
  async reconcile(){
    const snapshot=await this.state.read()
    const checks=[]
    const record=(task,activity,details={})=>checks.push({
      id:task.id,status:task.status,sessionID:task.sessionID,priorActivity:task.activity,activity,...details
    })
    for(const t of snapshot.tasks.filter(x=>BUSY.has(x.status))){
      if(t.status==="assigned" && t.activity==="prompting"){
        record(t,"prompt-admission-pending")
        continue
      }
      if(!t.sessionID){
        record(t,t.activity==="creating-session"?"session-create-pending":"unconfirmed-session")
        continue
      }
      try{
        const response=unwrap(await this.client.session.get({sessionID:t.sessionID}))
        record(t,response?.id?"session-present":"unconfirmed-session")
      }catch(e){record(t,"session-unreachable",{error:String(e)})}
    }
    return this.state.transaction(state=>{
      for(const check of checks){
        const t=state.tasks.find(x=>x.id===check.id)
        if(!t||!BUSY.has(t.status))continue
        // Do not let a slow Session GET overwrite a newer dispatch state.
        if(t.status!==check.status||t.sessionID!==check.sessionID||t.activity!==check.priorActivity)continue
        if(check.activity==="session-create-pending"||check.activity==="prompt-admission-pending")continue
        t.activity=check.activity
        if(check.activity==="unconfirmed-session" && t.status==="assigned")t.sessionUnknown=true
        if(check.activity==="session-unreachable" || (check.activity==="unconfirmed-session" && t.status==="assigned")){
          if(t.status!=="blocked")changeStatus(t,"blocked","reconciliation requires operator review")
        }
      }
      log(state,"reconcile",null,{checks})
      return checks
    })
  }
}
