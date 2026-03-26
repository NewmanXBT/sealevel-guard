# Roadmap

## Direction

Sealevel Guard should ship in two phases:

1. `skill-native`
2. `service-native`

This keeps engineering and commercialization in the right order.

## Phase 1: Skill-Native

### Objective

Make the core local skill workflow real before adding pricing, quoting, or x402.

### Success Condition

A human operator can run a single command against a real Solana program address
from a local host runtime and receive a real risk report.

Target flow:

`program address -> verified source -> audit runtime -> risk report`

### Must Ship

- `program_address` resolver
- verified-build lookup
- verified source snapshot fetch
- source bundle generation
- orchestrator runtime
- specialist bundle execution
- dedupe and judging
- `report.md`
- `risk-report.json`

### Should Ship

- 2 to 3 verified public program case studies
- sample outputs committed to repo
- explicit unsupported-state handling
- one stable CLI entrypoint

### Not In Scope

- x402
- pricing engine
- quoted audit jobs
- Quick Scan service layer
- interface-level IDL review
- broad native Rust coverage

## Phase 2: Service-Native

### Objective

Turn the stage 1 pipeline into a hosted service other agents can call.

### Success Condition

An external agent can submit a `program_address`, pay, and receive a structured
risk brief without bringing its own local runtime.

### Must Ship

- hosted review runtime
- `estimate` contract
- job lifecycle
- persistent result storage
- payment integration
- agent-facing API

### Should Ship

- x402 settlement
- quoted pricing by complexity band
- queueing and retries
- observability
- buyer-specific output variants

## Immediate Execution Order

1. Finish the engineering loop for verified-source programs.
2. Prove the loop on real mainnet examples.
3. Stabilize output contracts.
4. Only then add quoting, jobs, and payment rails.

## Product Rule

Do not commercialize a pipeline that is not yet operational.

The trust gate must work before the market wrapper is added around it.
