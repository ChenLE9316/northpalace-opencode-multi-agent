# Hybrid Models — Windows 11 local-first

## Decision

**Hybrid means local-first with an explicitly configured cloud lane, not an unconditional cloud fallback.**

- Model inventory comes from the V2 `model.list` API filtered by project location.
- Eligible agents need tool calling; reject models where `capabilities.tools !== true`.
- Local priority: LM Studio, Ollama, vLLM; no implicit or guessed model IDs.
- Set `NP_LOCAL_MODEL` to pin an exact discovered local model ID (optional).
- Cloud is only eligible with **both** `NP_ALLOW_CLOUD=1` and `NP_CLOUD_MODEL=provider/model-id`.
- An `auto` task uses local while any valid local model is present. To force paid cloud choose `lane=cloud`.
- Default `NP_MAX_LOCAL=1`, `NP_MAX_CLOUD=1` admission slots; tune after runtime load testing. These are admission policies, not GPU VRAM enforcement.

## Why

Different OpenCode Sessions can compete for the same local model RAM/VRAM and KV cache. A queued task does not grant memory. Use the actual Provider/model capabilities rather than assuming a certain GPU or historical model is installed.

## Future

- Dynamic failure classification and optional policy-driven failover (only with explicit financial authorization).
- Per-provider token/cost budget and queue fairness.
- Capability-aware routing for image/audio/browser workloads.
- Better local endpoint health and context/performance samples.

Currently there is no automatic paid fallback, no cross-provider request retry and no real-time budget enforcement.
