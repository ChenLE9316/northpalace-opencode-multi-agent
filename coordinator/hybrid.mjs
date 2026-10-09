const LOCAL=new Set(["lmstudio","ollama","vllm"])
const ref=(m)=>({providerID:m.providerID,id:m.modelID??m.id})
export function readModels(response){
  const data=response?.data??response
  if(!Array.isArray(data))throw Error("model.list did not return an array")
  return data.filter(x=>x&&typeof x.providerID==="string"&&typeof (x.modelID??x.id)==="string")
}
export function selectModel(models,{lane="auto",localModel,cloudModel,allowCloud=false}={}){
  if(!["auto","local","cloud"].includes(lane))throw Error("invalid lane")
  const available=models.filter(m=>m.capabilities?.tools===true)
  const find=(name,candidates)=>{
    if(name){
      const m=candidates.find(m=>m.providerID+"/"+(m.modelID??m.id)===name)
      if(!m)throw Error("configured model not discovered with tools capability: "+name)
      return m
    }
    return candidates[0]
  }
  const local=available.filter(m=>LOCAL.has(m.providerID))
  const cloud=available.filter(m=>!LOCAL.has(m.providerID))
  if(lane!=="cloud" && local.length){
    const chosen=find(localModel,local)
    return {...ref(chosen),lane:"local"}
  }
  if(lane==="local")throw Error("no local model with tool capability discovered")
  if(!allowCloud)throw Error("cloud route disabled; set NP_ALLOW_CLOUD=1 explicitly")
  if(!cloudModel)throw Error("explicit NP_CLOUD_MODEL provider/model is required for paid cloud route")
  const chosen=find(cloudModel,cloud)
  return {...ref(chosen),lane:"cloud"}
}
export function publicModels(models){return readModels(models).map(m=>({
  id:m.providerID+"/"+(m.modelID??m.id),
  tools:m.capabilities?.tools===true,
  lane:LOCAL.has(m.providerID)?"local":"cloud",
  context:m.limit?.context??null
}))}
export function modelOptions(env=process.env){
  return {
    localModel:env.NP_LOCAL_MODEL||undefined,
    cloudModel:env.NP_CLOUD_MODEL||undefined,
    allowCloud:env.NP_ALLOW_CLOUD==="1",
  }
}
export function limits(env=process.env){
  const read=(key,fallback)=>{
    const n=Number(env[key]??fallback)
    if(!Number.isSafeInteger(n)||n<0||n>16)throw Error(key+" must be an integer 0..16")
    return n
  }
  return {local:read("NP_MAX_LOCAL",1),cloud:read("NP_MAX_CLOUD",1)}
}
