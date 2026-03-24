# Sealevel Guard

Agent-native Solana security infrastructure.

`Sealevel Guard` is an Anchor-first Solana audit agent that other agents can call
before they deploy, integrate, trade, route funds, or allocate treasury.

This repository currently focuses on:

- submission narrative,
- ecosystem references,
- positioning and pricing thesis,
- early product framing for the hackathon.

## Core Thesis

Most agents can take action on Solana. Very few can judge protocol risk before
they act.

Sealevel Guard aims to become the security clearing layer for the Solana agent
economy:

- treasury agents ask whether capital should flow into a protocol,
- trading agents ask whether a venue or strategy path is too risky,
- deployment agents ask whether a codebase is safe enough to ship,
- integration agents ask whether a program is safe enough to depend on.

The output is not just a human-readable report. It is a machine-readable risk
brief that another agent can act on.

## Commercial Model

We are not treating audit as a pure pay-per-request API.

The main economic unit is the `audit job`, priced by codebase complexity and
selected audit scope. x402 is the payment rail, not the pricing model.

Planned product layers:

1. `Quick Scan`
   - lightweight endpoint for coarse triage
   - may be priced per request
2. `Quoted Audit`
   - priced per codebase / scope / depth
   - the primary revenue path
3. `Risk Brief`
   - structured JSON output for upstream agents
   - may be standalone or bundled into a quoted audit

## Docs

- [Narrative](./docs/NARRATIVE.md)
- [References](./docs/REFERENCES.md)
- [Positioning](./docs/POSITIONING.md)

## Working Product Direction

Anchor-first Solana audit skills:

- access control,
- PDA integrity,
- account constraints,
- CPI risk,
- token and vault invariants,
- governance and upgradeability risk.

## Status

Early planning repo. No implementation yet.
