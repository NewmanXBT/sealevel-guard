# Sealevel Guard

Agent-native Solana security infrastructure for evaluating protocol and code
risk before agents deploy, integrate, trade, or move capital.

`Sealevel Guard` is an Anchor-first Solana audit system designed for machine
consumers. Instead of producing only a human-readable report, it aims to return
a structured risk brief that upstream agents can use to allow, warn, deny, or
escalate an action.

> [!NOTE]
> Current status: stage 1, local skill-native workflow.
> The implemented path is `program address or local path -> source resolution ->
> specialist review -> risk brief`.

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

## What The Product Is Today

Sealevel Guard currently exists as a local trust gate for Solana agents.
The intended operator flow is:

1. install or load the skill into a host runtime such as `Claude Code`
2. point an agent at a Solana `program address` or local Anchor path
3. let the local runtime execute the review
4. receive a structured risk brief and report

Today, the product is best understood as:

- an Anchor-first security judgment layer for Solana agents,
- a local review capability that can be invoked from agent runtimes,
- and a machine-readable risk brief generator for agent decisions.

## What The Product May Become Later

If the local agent workflow proves out, Sealevel Guard can later expand into a
hosted, agent-facing service layer built around:

1. `Quick Scan`
   - lightweight intake and coarse triage
2. `Quoted Audit`
   - quoted review jobs priced by codebase complexity and scope
3. `Risk Brief`
   - structured output for downstream agents and automated decisions

That is future product surface built on top of the current agent workflow.

## What The First Release Focuses On

The initial scope is intentionally narrow: Anchor-first Solana audit workflows.

Planned audit skill areas:

- access control,
- PDA integrity,
- account constraints,
- CPI risk,
- token and vault invariants,
- governance and upgradeability risk.

## How To Use

Sealevel Guard currently supports one implemented execution path:

`program address or local Anchor repo -> source bundle -> specialist review -> risk brief`

### Prerequisites

- Node.js 20 or newer
- network access to a Solana RPC endpoint and verified-build metadata
- Claude Code if you want to run the product as intended from a local host runtime
- optional: Codex CLI if you want to experiment with a Codex-backed specialist runtime

### Quick Start

Install:

```bash
npx skills add NewmanXBT/sealevel-guard
```

Run review:

```bash
/sealevel-guard:sealevel-guard-review <program_address_or_local_path>
```

### Outputs

By default Sealevel Guard writes review artifacts under:

- `artifacts/reviews/<target>/resolution.json`
- `artifacts/reviews/<target>/bundle-manifest.json`
- `artifacts/reviews/<target>/specialist-findings.json`
- `artifacts/reviews/<target>/judged-risk-brief.json`
- `artifacts/reviews/<target>/report.md`

See [How To Use](./docs/HOW_TO_USE.md) for the full operator flow and runtime notes.

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

This repository currently contains the stage 1 product framing and current
agent-facing implementation for the project:

- [Narrative](./docs/NARRATIVE.md)
- [Positioning](./docs/POSITIONING.md)
- [Product Spec](./docs/PRODUCT_SPEC.md)
- [How To Use](./docs/HOW_TO_USE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Roadmap](./docs/ROADMAP.md)
- [X Article Draft](./docs/X_ARTICLE.md)

## Positioning

Sealevel Guard is not a generic crypto chatbot, a chain-agnostic Rust scanner,
or a thin pay-per-request x402 demo.

Right now it is a local trust gate for Solana agents and operators. Over time,
it can become security clearing infrastructure for the Solana agent economy: a
system agents call before they deploy code, integrate programs, or route funds.
