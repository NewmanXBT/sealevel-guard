# Product Spec

## Product

Sealevel Guard

## Summary

Sealevel Guard is an Anchor-first trust gate for Solana agents. It allows other
agents to request risk evaluation before they deploy code, integrate protocols,
or move capital. The system is designed around quoted audit jobs, with x402
used as the settlement rail.

## Product Goal

Turn Solana security review into a machine-readable service that upstream agents
can use as a decision primitive.

## Positioning

Sealevel Guard should be understood as:

- a trust gate,
- not a generic scanner,
- not a human-first audit chatbot,
- and not a pure pay-per-request x402 demo.

## Non-Goals

- replacing full manual audits,
- supporting every Solana Rust pattern on day one,
- maximizing breadth over clarity,
- or pretending all audit work should be priced per HTTP request.

## Main Users

- integration agents,
- treasury agents,
- deployment agents,
- builder agents,
- trading agents,
- and secondarily the humans operating those agents.

## User Priority

### Demo wedge

- builder / deployment agents

### Best long-term buyer

- integration agents

### High-value expansion

- treasury / capital allocation agents

## Primary Jobs To Be Done

### Job 1: Pre-integration risk check

An agent wants to know whether a Solana program is safe enough to integrate.

### Job 2: Pre-deployment code review

An agent or developer wants to know whether a codebase contains obvious
ship-blocking issues before release.

### Job 3: Capital allocation gate

A treasury or strategy agent wants a fast security signal before routing funds.

## Product Principles

- agent-readable first,
- Solana-native first,
- quote-first economics,
- async job execution,
- benchmark-backed credibility.

## Differentiation

### Versus scanners

Scanners produce findings. Sealevel Guard produces an actionable trust decision
for another agent.

### Versus AI audit tools

Most AI audit tools are still human-first. Sealevel Guard is agent-readable
first.

### Versus token risk products

We are not primarily scoring meme coins, rugs, or market behavior. We are
evaluating whether another agent should trust a Solana codebase or program.

## Core Concepts

### 1. Estimate

The caller submits metadata about a target:

- repo URL,
- zip file,
- local snapshot,
- optional program ID,
- optional IDL.

The system returns:

- supported / unsupported,
- complexity band,
- suggested skill bundle,
- recommended depth,
- quoted price,
- ETA.

Estimate must also be able to reject unsupported or margin-destructive inputs
loudly.

### 2. Audit Job

Once the caller accepts the quote and pays, Sealevel Guard creates an audit job.

Job lifecycle:

- `estimated`
- `quoted`
- `paid`
- `queued`
- `running`
- `completed`
- `failed`
- `expired`

### 3. Risk Brief

The main output artifact for other agents.

Fields:

- target identifier,
- complexity band,
- risk score,
- recommendation,
- ship blocker flag,
- findings,
- evidence references,
- remediation notes,
- confidence summary.

## First Release Scope

Anchor-first only.

### First Release Operator Flow

The first release is consumed locally before it becomes a hosted service.

Current usage shape:

1. supply a Solana program address or local Anchor repo
2. choose a requested action: `ship`, `integrate`, or `allocate`
3. run the review orchestrator locally
4. receive a human-readable report plus a machine-readable risk brief

Representative command:

```bash
npm run review-program -- \
  --program <PROGRAM_ADDRESS_OR_LOCAL_PATH> \
  --requested-action integrate \
  --runtime mock
```

### Skill Bundle

#### Access Control

- missing signer checks,
- unsafe authority updates,
- privileged instruction exposure,
- upgrade authority concentration.

#### PDA Integrity

- insecure seeds,
- weak PDA validation,
- account role confusion,
- authority spoofing paths.

#### Account Constraints

- missing owner checks,
- bad account constraint assumptions,
- mutable account misuse,
- unsafe remaining accounts.

#### CPI Risk

- arbitrary CPI targets,
- unvalidated program IDs,
- privilege propagation,
- callback trust assumptions.

#### Token / Vault Invariants

- mint and burn authority issues,
- withdrawal control failures,
- accounting drift,
- fee and redemption mismatch.

## Pricing Model

### Position

Price by codebase complexity and audit scope.

Do not price full audits as simple pay-per-request API calls.

### Why

Audit cost depends on:

- LOC,
- number of programs,
- framework complexity,
- selected skills,
- depth,
- and output artifact expectations.

This makes quoted work the correct core business model.

### Proposed Tiers

#### Quick Scan

- fixed low price
- coarse triage only
- suitable for lightweight intake
- acceptable as per-request pricing

#### Standard Audit

- quoted by codebase band
- default skill bundle
- machine-readable risk brief included
- primary revenue path

#### Deep Audit

- quoted by codebase band plus deeper reasoning
- expanded findings and remediation
- suitable for higher-value decisions

### Reject Rules

The estimate phase should classify and return clear states for:

- unsupported repo format
- no detectable Solana program
- native Rust when unsupported
- repo too large for current release
- expired quote

## x402 Role

x402 is used for payment settlement.

It is not the source of truth for pricing logic.

The posture should be x402-forward, but not x402-dependent.

### Intended flow

1. caller requests estimate
2. system returns quote
3. caller pays through x402-compatible flow
4. audit job begins
5. caller polls or subscribes for status
6. caller receives risk brief

### Demo posture

For hackathon demo, keep one safety valve:

- pre-funded demo wallet,
- simulated paid flow,
- or a controlled fallback path.

## API Draft

### `POST /estimate`

Purpose:

- classify target,
- estimate complexity,
- return price and ETA.

Input:

```json
{
  "source_type": "repo_url",
  "source": "https://github.com/example/protocol",
  "idl_url": null,
  "requested_depth": "standard",
  "requested_skills": ["access-control", "pda-integrity", "cpi-risk"]
}
```

Output:

```json
{
  "estimate_id": "est_123",
  "supported": true,
  "framework": "anchor",
  "complexity_band": "tier_2",
  "recommended_depth": "standard",
  "quote_usdc": "0.75",
  "eta_seconds": 420,
  "expires_at": "2026-03-24T20:00:00Z"
}
```

### `POST /quotes/{estimate_id}/accept`

Purpose:

- create a payable quote session.

Output:

- quote status,
- payment instructions,
- x402 settlement metadata.

### `POST /jobs`

Purpose:

- create an audit job after payment confirmation.

Output:

```json
{
  "job_id": "job_123",
  "status": "queued"
}
```

### `GET /jobs/{job_id}`

Purpose:

- return job status and progress.

### `GET /jobs/{job_id}/risk-brief`

Purpose:

- return final machine-readable result.

Output:

```json
{
  "target": "example/protocol",
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

## State Machine

```text
submitted_for_estimate
  -> estimated
  -> quoted
  -> paid
  -> queued
  -> running
  -> completed

quoted -> expired
paid -> failed
running -> failed
```

## Best Hackathon Demo

### Demo actor

A builder or deployment agent.

### Demo flow

1. Agent discovers a new protocol.
2. Agent requests estimate from Sealevel Guard.
3. Sealevel Guard returns quoted audit scope.
4. Agent pays.
5. Sealevel Guard runs Solana audit skills.
6. Agent receives structured risk brief.
7. Agent refuses to integrate or deploy because of a high-confidence finding.

## MVP Checklist

- estimate endpoint
- complexity bands
- quoted audit flow
- one paid path
- one final risk brief JSON schema
- 3 to 5 Solana skills
- one benchmark-backed demo example
- one explicit unsupported / rejected path

## Open Decisions

- whether Quick Scan should be included in hackathon MVP,
- how estimate handles very large repos,
- whether unsupported native Rust repos should be hard-rejected or soft-scored,
- what the first public pricing bands should be,
- whether x402 needs a non-demo fallback,
- and whether reports should include both JSON and markdown in v1.
