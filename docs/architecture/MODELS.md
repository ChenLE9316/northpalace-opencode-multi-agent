# Models / local provider resource schedule

No provider model ID is hard-coded in this repository; use a tool-capable model that the current V2 instance has actually discovered.

## Scheduler policy

- Model capability gate: Code Mode/tool calling, context, output cap, multimodal needs.
- Avoid parallel model sessions whose combined VRAM/KV cache exceeds available capacity.
- First milestone uses one active model writer; grow to two or three only after measuring latency and memory.
- Subagents inherit parent's model unless a profile explicitly overrides it.
- Track session model, queue time, token/cost/latency, error and retry.
- Prefer small/fast models for pure exploration only if they reliably use the required tools.

## Local provider options

V2 can discover LM Studio and Ollama. For custom OpenAI-compatible APIs explicitly configure provider metadata and verify actual model/tool capabilities.

## Deliberate omissions

This repository does not presume a particular GPU, LM Studio model ID or local port is currently available on the machine running OpenCode. Browser depends on Desktop attachment, not on model choice alone.
