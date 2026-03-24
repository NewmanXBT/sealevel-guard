# Product Spec

## Product

Sealevel Guard

## Summary

Sealevel Guard is an Anchor-first Solana audit agent that allows other agents
to request risk evaluation before they deploy code, integrate protocols, or
move capital. The system is designed around quoted audit jobs, with x402 used
as the settlement rail.

## Product Goal

Turn Solana security review into a machine-readable service that upstream agents
can use as a decision primitive.

## Non-Goals

- replacing full manual audits,
- supporting every Solana Rust pattern on day one,
- maximizing breadth over clarity,
- or pretending all audit work should be priced per HTTP request.

## Main Users

- treasury agents,
- integration agents,
- deployment agents,
- trading agents,
- builder agents,
- and secondarily the humans operating those agents.

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

### Proposed Tiers

#### Quick Scan

- fixed low price
- coarse triage only
- suitable for lightweight intake

#### Standard Audit

- quoted by codebase band
- default skill bundle
- machine-readable risk brief included

#### Deep Audit

- quoted by codebase band plus deeper reasoning
- expanded findings and remediation
- suitable for higher-value decisions

## x402 Role

x402 is used for payment settlement.

It is not the source of truth for pricing logic.

### Intended flow

1. caller requests estimate
2. system returns quote
3. caller pays through x402-compatible flow
4. audit job begins
5. caller polls or subscribes for status
6. caller receives risk brief

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

A treasury or integration agent.

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

## Open Decisions

- whether Quick Scan should be included in hackathon MVP,
- how estimate handles very large repos,
- whether unsupported native Rust repos should be hard-rejected or soft-scored,
- what the first public pricing bands should be,
- and whether reports should include both JSON and markdown in v1.
