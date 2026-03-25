# Sealevel Guard

Agent-native Solana security infrastructure for evaluating protocol and code
risk before agents deploy, integrate, trade, or move capital.

`Sealevel Guard` is an Anchor-first Solana audit system designed for machine
consumers. Instead of producing only a human-readable report, it aims to return
a structured risk brief that upstream agents can use to allow, warn, deny, or
escalate an action.

> [!NOTE]
> Current status: early planning repo with an address-resolution prototype.
> The first implemented path is `program address -> verified build -> source
> snapshot`. Interface-level review remains future work.

## Why It Exists

Solana agents can already execute.

They can ship code, integrate protocols, route capital, and call payment or
data services. What they still lack is a native security judgment layer before
they act.

Sealevel Guard is being designed to fill that gap for:

- deployment agents deciding whether code is safe enough to ship,
- integration agents deciding whether a program is safe enough to depend on,
- treasury agents deciding whether capital should flow into a protocol,
- trading agents deciding whether a venue or execution path is too risky.

The goal is to turn Solana security review into a machine-readable decision
primitive.

## What The Product Looks Like

Sealevel Guard is being shaped around three product layers:

1. `Quick Scan`
   - lightweight intake and coarse triage
   - returns support status, rough complexity, and whether deeper review is
     recommended
2. `Quoted Audit`
   - the primary commercial unit
   - priced by codebase complexity, selected audit scope, and review depth
3. `Risk Brief`
   - structured output for downstream agents
   - designed to support allow, warn, deny, or escalate decisions

`x402` is the settlement rail, not the pricing model. The economic unit is the
audit job, not the raw API request.

## What The First Release Focuses On

The initial scope is intentionally narrow: Anchor-first Solana audit workflows.

Planned audit skill areas:

- access control,
- PDA integrity,
- account constraints,
- CPI risk,
- token and vault invariants,
- governance and upgradeability risk.

## Example Risk Brief

The core artifact is intended to be agent-readable:

```json
{
  "target": "repo_or_program",
  "risk_score": 71,
  "recommendation": "deny",
  "ship_blocker": true,
  "findings": [
    {
      "skill": "cpi-risk",
      "severity": "high",
      "confidence": 0.84,
      "title": "Unvalidated CPI target",
      "evidence": ["programs/vault/src/lib.rs:118"]
    }
  ]
}
```

## What Exists In This Repo Today

This repository currently contains the product framing for the project:

- [Narrative](./docs/NARRATIVE.md)
- [Positioning](./docs/POSITIONING.md)
- [Product Spec](./docs/PRODUCT_SPEC.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Roadmap](./docs/ROADMAP.md)
- [X Article Draft](./docs/X_ARTICLE.md)

## Positioning

Sealevel Guard is not a generic crypto chatbot, a chain-agnostic Rust scanner,
or a thin pay-per-request x402 demo.

It is being positioned as security clearing infrastructure for the Solana agent
economy: a system other agents can call before they deploy code, integrate
programs, or route funds.
