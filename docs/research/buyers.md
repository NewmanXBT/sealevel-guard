# Buyer Research

## Question

Who is the first real user or buyer we should optimize for?

## Executive Takeaway

There is a difference between:

- the most visible users in the current Solana agent wave,
- and the best first buyers for Sealevel Guard.

The visible users today include:

- builder agents,
- trading agents,
- governance or ops agents,
- and token-launch agents.

But the best first buyer for this product is likely one of:

- an integration agent,
- a treasury or capital-allocation agent,
- or a builder/deployment agent with high-value launch decisions.

My recommendation is:

### Demo user

`builder / deployment agent`

Reason:

- easiest to explain,
- easiest to simulate,
- closest to current AI-coding behavior,
- strongest overlap with current Solana hackathon culture.

### Long-term buyer

`integration agent` or `treasury agent`

Reason:

- clearer willingness to pay for risk reduction,
- direct tie to capital at risk,
- more natural consumer of `allow / warn / deny` outputs.

## Evidence From The Ecosystem

### Solana's AI ecosystem is broad, not narrow

Solana's AI page frames the ecosystem around:

- agent connectivity,
- inference and compute,
- data,
- and payments.

It explicitly highlights products like `Solana Agent Kit` and agentic
infrastructure rather than a single dominant app category.

Reference:

- https://solana.com/solutions/ai

### The Solana Foundation's February 2026 report shows current agent usage

The report points to:

- Realms MCP for governance workflows
- Helius tooling for agent API-key creation
- QuickNode x402 support for AI agent authentication
- CoinGecko and Nansen x402-powered data APIs
- DFlow MCP for Solana trading
- token deployment flows and agent auth tooling

This tells us the current visible agent economy is concentrated around:

- governance / ops,
- data access,
- trading,
- token launch,
- and developer operations.

Reference:

- https://solana.com/news/state-of-solana-february-2026

## Buyer Segments

## 1. Builder / Deployment Agent

What they want:

- a fast pre-ship security check,
- clear ship blockers,
- remediation hints,
- low-friction intake from repo or local snapshot.

Why they matter:

- they are already close to today's AI coding workflows,
- they are easy to demo in a hackathon,
- and they make the "audit your AI-generated Solana code" story legible.

Why they may not be the best long-term buyer:

- lower willingness to pay than capital allocators,
- likely to compare us with scanners and free tools,
- likely to be price-sensitive.

Confidence:

- high for demo relevance,
- medium for long-term revenue fit.

## 2. Integration Agent

What they want:

- a trust gate before relying on another protocol,
- a yes/no recommendation,
- structured evidence,
- and fast enough turnaround to fit integration workflows.

Why they matter:

- they do not want a PDF,
- they want a decision primitive,
- which fits Sealevel Guard better than any other segment.

Why they are attractive:

- closest fit to our machine-readable risk brief,
- stronger willingness to pay than pure builder tools,
- clear business value: avoid integrating bad systems.

Confidence:

- medium-high for long-term fit,
- medium for immediate visibility in current public agent stack.

## 3. Treasury / Capital Allocation Agent

What they want:

- risk gating before deposits, routing, or capital allocation,
- clear allow/warn/deny outputs,
- confidence calibration,
- and the ability to compare multiple targets.

Why they matter:

- their decisions directly control money,
- the cost of a bad decision is high,
- and "trust gate for capital" is a very strong narrative.

Why they are risky as the first wedge:

- they may demand stronger evidence than v1 can provide,
- they pull the product toward richer protocol and economic analysis,
- and they may need more on-chain context than code-only review.

Confidence:

- medium for long-term value,
- lower for initial implementation simplicity.

## 4. Trading Agent

What they want:

- rapid signals,
- often at high frequency,
- usually tied to venue or token safety.

Why they are not the best first buyer:

- they drag the product toward token intelligence and market risk,
- they create pressure for low latency and low pricing,
- and they can blur the distinction between Sealevel Guard and token scanners.

Confidence:

- low as the best first buyer.

## 5. Governance / Ops Agent

What they want:

- authority and upgrade risk checks,
- governance action safety,
- validation before executing operations.

Why they are interesting:

- the Realms MCP direction suggests governance agents are real,
- and governance actions map well to access control and authority reasoning.

Why they are probably not the first wedge:

- smaller visible market than builder flows,
- narrower and more specialized story than deployment or integration.

Confidence:

- medium as an extension.

## Recommended Segmentation Strategy

```text
DEMO WEDGE
  builder / deployment agent

BEST LONG-TERM BUYER
  integration agent

MOST VALUABLE LONG-TERM EXPANSION
  treasury / capital-allocation agent
```

## Positioning Implication

We should not say:

"We serve every agent equally."

We should say:

"Sealevel Guard helps agents make high-consequence trust decisions on Solana."

And then sequence:

1. `ship decision`
2. `integration decision`
3. `capital allocation decision`

## Product Implication

The output schema should prioritize:

- recommendation,
- confidence,
- evidence,
- and blocking severity.

That is more valuable to integration and treasury-style agents than a long list
of raw findings.

## Research Conclusion

The right move is to optimize:

- messaging and demo for builder / deployment agents,
- while keeping the product architecture pointed at integration and treasury use
  cases.
