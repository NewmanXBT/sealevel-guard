# Architecture

## Summary

Sealevel Guard is being built in two stages:

1. `skill-native`
2. `service-native`

The first stage is the current engineering focus.

It is not a hosted audit platform yet.
It is a review pipeline that can be consumed by local agent runtimes such as
Claude Code, Codex, or similar skill-capable hosts.

## Stage 1: Skill-Native Architecture

### Goal

Run the full engineering loop:

`program address -> verified source -> audit runtime -> risk report`

### Runtime Split

Sealevel Guard owns:

- address resolution
- verified-build lookup
- source snapshot fetching
- source bundle construction
- review orchestration contract
- findings deduplication
- trust judgment
- final risk report formatting

The host agent runtime owns:

- specialist model execution
- parallel subagent spawning
- prompt bundle consumption
- reasoning over source bundles

This mirrors the way `pashov/skills` works:

- the product defines the skill contract
- the host runtime executes the agents

### Stage 1 Components

#### 1. Resolver

Input:

- `program_address`

Responsibilities:

- fetch on-chain program metadata
- query verified-build status
- if verified, fetch repo + commit source snapshot

Current implementation boundary:

- verified-source path only
- interface-level IDL review is future work

#### 2. Bundle Builder

Input:

- resolved source snapshot

Output:

- `source.md`
- specialist bundles

Responsibilities:

- apply include/exclude rules
- preserve relative file paths
- prepare stable audit inputs

#### 3. Review Orchestrator

Primary entrypoint:

- `sealevel-guard-review`

Responsibilities:

- classify support state
- assign framework classification
- select specialist skills
- hand bundles to specialist agents
- merge results

#### 4. Specialist Layer

Current specialist set:

- access-control
- pda-integrity
- account-constraints
- cpi-risk
- token-invariants
- governance-upgrade-risk

These should be treated as internal review modules, not the main public
interface.

#### 5. Judge And Report Layer

Responsibilities:

- normalize findings
- deduplicate by trust-surface key
- assign final recommendation
- emit:
  - human-readable report
  - machine-readable risk brief JSON

### Stage 1 Execution Model

For human operators:

1. provide a Solana `program_address`
2. run Sealevel Guard locally
3. let local agent runtime execute review skills
4. receive `report.md` and `risk-report.json`

### Current Operator Entry Point

The current entry point is the `review-program` script:

```bash
npm run review-program -- \
  --program <PROGRAM_ADDRESS_OR_LOCAL_PATH> \
  --requested-action <ship|integrate|allocate> \
  --runtime <mock|codex>
```

This script composes the full stage 1 loop:

1. resolve the program address or local source path
2. fetch or classify the source snapshot
3. build specialist bundles
4. run specialist reviews
5. judge findings
6. emit a final report and machine-readable risk brief

Default output directory:

- `artifacts/reviews/<target>/`

This means first-release Sealevel Guard is best understood as:

- a security capability package
- plus a resolver and review protocol

It is not yet a fully hosted service.

## Stage 2: Service-Native Architecture

### Goal

Expose the same review capability to external agents as a hosted service.

### Key Difference

In stage 1, the user brings the runtime.

In stage 2, Sealevel Guard hosts the runtime.

That means Sealevel Guard would own:

- intake API
- job queue
- hosted specialist execution
- result storage
- payment integration
- service-level reliability

### Likely Flow

`program address -> resolve -> estimate -> pay -> run review -> return risk brief`

### Important Constraint

This service is still predominantly chain-offloaded.

The heavy work is not performed onchain:

- source fetching
- tarball download
- multi-agent reasoning
- bundle generation
- dedupe and judging

The chain is relevant for:

- target identification
- optional settlement
- optional capability gating

Not for running the audit itself.

## Architectural Principle

The protocol should stay stable across both stages.

Only the runtime location changes:

- stage 1: user-hosted agent runtime
- stage 2: Sealevel-hosted agent runtime

That is the correct way to keep early engineering work reusable.
