import test from "node:test"
import assert from "node:assert/strict"
import {selectModel,readModels,limits} from "../hybrid.mjs"
const models=[
 {providerID:"lmstudio",modelID:"local-tool",capabilities:{tools:true}},
 {providerID:"lmstudio",modelID:"no-tool",capabilities:{tools:false}},
 {providerID:"openai",modelID:"cloud-tool",capabilities:{tools:true}}
]
test("local first on auto",()=>{
 assert.deepEqual(selectModel(models,{lane:"auto",cloudModel:"openai/cloud-tool",allowCloud:true}),{providerID:"lmstudio",id:"local-tool",lane:"local"})
})
test("cloud requires explicit opt-in and model ID",()=>{
 assert.throws(()=>selectModel(models,{lane:"cloud"}))
 assert.throws(()=>selectModel(models,{lane:"cloud",allowCloud:true}))
 assert.deepEqual(selectModel(models,{lane:"cloud",allowCloud:true,cloudModel:"openai/cloud-tool"}),{providerID:"openai",id:"cloud-tool",lane:"cloud"})
})
test("refuse silent cloud fallback",()=>{
 assert.throws(()=>selectModel(models.filter(x=>x.providerID==="openai"),{lane:"auto"}))
})
test("capabilities and limits are validated",()=>{
 assert.equal(readModels({data:models}).length,3)
 assert.throws(()=>limits({NP_MAX_LOCAL:"abc"}))
 assert.throws(()=>selectModel(models,{lane:"local",localModel:"lmstudio/no-tool"}))
})
