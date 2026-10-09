import { randomUUID } from "node:crypto"
import { isAbsolute, resolve, relative, sep } from "node:path"

export const STATUSES = Object.freeze(["queued","assigned","running","review","accepted","integrated","blocked","failed","cancelled","changes_requested"])
export const TRANSITIONS = Object.freeze({
  queued:["assigned","cancelled"],
  assigned:["running","blocked","failed","cancelled"],
  running:["review","blocked","failed","cancelled"],
  review:["accepted","changes_requested","blocked"],
  accepted:["integrated","blocked"],
  changes_requested:["assigned","cancelled"],
  blocked:["assigned","cancelled"],
  failed:["assigned","cancelled"],
  cancelled:[],integrated:[]
})
export const BUSY = new Set(["assigned","running","review","blocked"])
const NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/
export function assert(condition,message){if(!condition)throw Error(message)}
export function normalizeTask(input, existing=[],workspace="") {
  assert(input && typeof input==="object","task must be an object")
  assert(typeof input.id==="string" && NAME.test(input.id),"invalid task ID")
  assert(!existing.some(t=>t.id===input.id),"duplicate task ID")
  assert(typeof input.goal==="string" && input.goal.trim().length>3 && input.goal.length<=12000,"invalid goal")
  const dependsOn = input.dependsOn ?? []
  assert(Array.isArray(dependsOn) && new Set(dependsOn).size===dependsOn.length,"invalid dependencies")
  assert(dependsOn.every(id=>id!==input.id && existing.some(t=>t.id===id)),"dependency must exist and not refer to self")
  assert(input.lane===undefined || ["auto","local","cloud"].includes(input.lane),"invalid model lane")
  assert(input.agent===undefined || input.agent==="NorthPalac","coordinator only creates NorthPalac root sessions; use native subagent delegation")
  assert(input.write===undefined || typeof input.write==="boolean","write must be boolean")
  const worktree = input.worktree ? resolve(input.worktree) : resolve(workspace)
  assert(isAbsolute(worktree),"worktree must be absolute")
  const criteria=input.acceptance??[]
  assert(Array.isArray(criteria) && criteria.length>0 && criteria.every(x=>typeof x==="string" && x.trim().length>0),"acceptance must contain at least one criterion")
  return {
    id:input.id,goal:input.goal.trim(),worktree,dependsOn,acceptance:criteria,
    write:input.write!==false,lane:input.lane??"auto",agent:"NorthPalac",
    status:"queued",sessionID:null,model:null,createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),evidence:[],activity:"unstarted",error:null
  }
}
export function changeStatus(task,next,note=""){
  assert((TRANSITIONS[task.status]??[]).includes(next),"invalid transition: "+task.status+" -> "+next)
  task.status=next;task.updatedAt=new Date().toISOString()
  if(note)task.evidence.push({type:"status",note,at:task.updatedAt})
  return task
}
export function canonicalLocation(requested,workspace,worktreeRoot){
  const p=resolve(requested),main=resolve(workspace),root=resolve(worktreeRoot)
  const part=relative(root,p)
  // Repo root OR a direct child of the designated sibling worktrees directory.
  assert(p===main || (!part.startsWith(".."+sep) && part!==".." && part!=="" && !isAbsolute(part) && !part.includes(sep) && part!=="."),"outside the authorized checkout/worktree root")
  return p
}
export function isReady(task,all){
  return task.status==="queued" && task.dependsOn.every(id=>all.find(t=>t.id===id)?.status==="integrated")
}
export function reservedWriters(tasks,worktree){
  return tasks.filter(t=>t.write && BUSY.has(t.status) && t.worktree===worktree)
}
export function canAssign(task,tasks,limits,selectedLane){
  if(!isReady(task,tasks))return {ok:false,reason:"dependencies"}
  if(task.write && reservedWriters(tasks,task.worktree).length)return {ok:false,reason:"writer_conflict"}
  const occupied=tasks.filter(t=>BUSY.has(t.status)&&t.model?.lane===selectedLane).length
  if(occupied>=(limits[selectedLane]??0))return {ok:false,reason:"lane_capacity"}
  return {ok:true}
}
export function newId(prefix="task"){return prefix+"-"+randomUUID().slice(0,12)}
