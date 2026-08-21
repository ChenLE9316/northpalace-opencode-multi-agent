# Model Route Policy and Free-Model Disclaimer

NorthPalace is a runtime/governance reference architecture, not a guarantee that any particular hosted model, free tier, preview route, alias, quota, or provider policy will remain available.

## Authority order

For model availability and effective capabilities, use this order of authority:

1. the model catalog shown by the **actual target OpenCode Desktop/runtime/account/region**;
2. a successful target-runtime smoke plus the effective model/variant metadata exposed by that runtime;
3. current OpenCode/provider documentation;
4. repository examples, historical model IDs, screenshots, benchmark notes, and README text.

A model ID that still appears in documentation, an API list, or this repository may already be unavailable to a particular account/runtime. Conversely, a newly exposed Free/preview model may appear in Desktop before public documentation is updated.

## Free / contributor / preview routes

A `Free`, contributor, preview, stealth, alpha, or temporary route must be treated as **ephemeral**. OpenCode or the upstream provider may add, rename, replace, rate-limit, region-limit, account-limit, change, or remove it without notice. Free availability is not an SLA and is not a NorthPalace dependency guarantee.

NorthPalace does **not** warrant or guarantee any Free route's:

- continued availability, price, quota, rate limit, concurrency, latency, uptime, or quality;
- exact upstream model identity, weights, quantization, serving stack, or version;
- effective context window, output limit, cache behavior, compaction threshold, or long-context quality;
- supported reasoning/thinking modes, variant names, reasoning budget, or mapping of `reasoningEffort`;
- tool-calling, structured-output, multimodal, browser, MCP, or agent-loop behavior;
- privacy, zero-data-retention, training-data opt-out, logging, residency, or retention terms.

Stealth/alpha routes such as opaque aliases must never be assumed to be a particular upstream model unless the provider publishes that identity.

## Context-window rule

**Upstream model context is not the same thing as the effective OpenCode Free-route context.** A provider may advertise 256K, 1M, or another native window while the hosted Free route imposes a smaller request limit, output limit, early compaction, concurrency-dependent limit, or other runtime restriction.

Before assigning a model to L1, a coordinator, or a long-lived specialist, verify the effective target-runtime context behavior with the real account/runtime. If it cannot be observed, record it as `UNVERIFIED`; do not copy an upstream model-card number into NorthPalace as a runtime guarantee.

For Multi-Agent use, also consider aggregate pressure: multiple child sessions, long ResultEnvelopes, tool output, retry state, and L1 integration can make a model with an acceptable single-session window unsuitable for the full workflow.

## Reasoning / thinking variants

Reasoning controls are model-specific. A route may expose `none`, direct/no-think, `low`, `medium`, `high`, `max`, `xhigh`, an on/off thinking toggle, or no configurable reasoning level at all. OpenCode's visible variant list for the **selected model** is runtime evidence only for that model; it must not be generalized to another Free route.

Do not assume that `reasoningEffort: max` is portable. Before pinning a Free model to an agent, verify the exact variants accepted by that route. Unsupported values may be rejected, ignored, normalized, or mapped differently by the provider/runtime. Prefer model inheritance or a small number of verified routing classes over duplicating a temporary model ID across many agent files.

## Privacy and data-use disclaimer

`share: disabled` controls OpenCode sharing behavior; it does **not** establish provider-side zero retention or a prohibition on model-training use. Some free/contributor programs may exist specifically to collect feedback or training/evaluation data, and terms may differ by model, account, region, or plan.

Do not send secrets, credentials, private/customer repositories, regulated data, confidential business data, or other sensitive material to a Free/contributor route unless the Human Operator has independently verified the current provider terms and accepted them. For sensitive work, use a verified paid/private/local route whose retention and privacy terms satisfy the operator's requirements.

## Route-change procedure

Treat every model replacement as a runtime compatibility event rather than a search-and-replace exercise:

1. confirm the route exists in the actual Desktop/runtime catalog;
2. confirm the exact model ID and selectable reasoning variants;
3. measure effective context/output/compaction behavior instead of assuming upstream limits;
4. smoke tool calling, code editing, structured output, child Task behavior, and representative long-context work;
5. verify rate/concurrency behavior under NorthPalace fan-out;
6. review current privacy/data-use terms;
7. only then update the canonical routing matrix and deterministic validation expectations.

Historical model IDs left in a branch, document, or config are evidence of a previous bootstrap state, not a promise that the route is still live.
