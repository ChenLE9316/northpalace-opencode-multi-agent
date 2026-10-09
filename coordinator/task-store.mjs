import { mkdir,readFile,writeFile,rename,rm,open } from "node:fs/promises"
import { dirname,join,resolve } from "node:path"

const sleep=(ms)=>new Promise(done=>setTimeout(done,ms))
const defaultState=()=>({version:2,tasks:[],sessions:[],history:[]})
export class Store {
  constructor(directory){this.dir=resolve(directory);this.file=join(this.dir,"registry.json");this.guard=join(this.dir,".coordinator-lock")}
  async read(){
    try{
      const data=JSON.parse(await readFile(this.file,"utf8"))
      if(data.version!==2||!Array.isArray(data.tasks)||!Array.isArray(data.sessions))throw Error("incompatible registry schema")
      return data
    }catch(e){if(e.code==="ENOENT")return defaultState();throw e}
  }
  async transaction(mutator,{timeoutMs=10000}={}){
    await mkdir(this.dir,{recursive:true})
    const started=Date.now()
    while(true){
      try{await mkdir(this.guard);break}
      catch(e){
        if(e.code!=="EEXIST")throw e
        if(Date.now()-started>=timeoutMs)throw Error("registry locked; inspect other coordinator process. No automatic stale-lock stealing.")
        await sleep(50)
      }
    }
    try{
      const state=await this.read()
      const value=await mutator(state)
      if(state.history.length>1000)state.history=state.history.slice(-1000)
      const temp=this.file+"."+process.pid+"."+Date.now()+".tmp"
      try {
        await writeFile(temp,JSON.stringify(state,null,2)+"\n",{flag:"wx"})
        // sync file before atomic replacement. Windows rename is same-filesystem only.
        const fd=await open(temp,"r")
        try{await fd.sync()}finally{await fd.close()}
        await rename(temp,this.file)
      }finally{await rm(temp,{force:true}).catch(()=>{})}
      return value
    }finally{await rm(this.guard,{recursive:true,force:true})}
  }
}
export function log(state,type,taskId,details={}){
  state.history.push({type,taskId,details,at:new Date().toISOString()})
}
