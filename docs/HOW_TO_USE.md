# How To Use

## Summary

Sealevel Guard currently ships as a local review pipeline for Solana programs
and Anchor repositories.

The current supported flow is:

`program address or local path -> source resolution -> specialist review -> risk brief`

This is a stage 1, local agent workflow. In the intended setup, you invoke
Sealevel Guard from a host runtime such as `Claude Code` and execute the
review locally.

## Prerequisites

- Node.js 20 or newer
- network access to:
  - a Solana RPC endpoint
  - the verified-build status endpoint
- Claude Code for the primary local skill workflow
- optional: Codex CLI with valid auth if you want to experiment with a Codex-backed specialist runtime

Relevant environment variables:

- `SOLANA_RPC_URL`
- `SOLANA_VERIFIED_STATUS_URL`
- `SEALEVEL_GUARD_RUNTIME`

## Primary Command

From the repository root:

```bash
npm run review-program -- \
  --program <PROGRAM_ADDRESS_OR_LOCAL_PATH> \
  --requested-action <ship|integrate|allocate> \
  --runtime <mock|codex>
```

Arguments:

- `--program`
  - required
  - accepts either a Solana program address or a local repo path
- `--requested-action`
  - optional
  - defaults to `integrate`
- `--runtime`
  - optional
  - defaults to `mock`
- `--out-dir`
  - optional when calling the underlying script directly
  - defaults to `artifacts/reviews`

## Examples

### Review a verified on-chain program

```bash
npm run review-program -- \
  --program 5JsSAL3kJDUWD4ZveYXYZmgm1eVqueesTZVdAvtZg8cR \
  --requested-action integrate \
  --runtime mock
```

### Review a local Anchor repository before shipping

```bash
npm run review-program -- \
  --program ./path/to/anchor-project \
  --requested-action ship \
  --runtime mock
```

### Run with Codex-backed specialists

```bash
npm run review-program -- \
  --program ./path/to/anchor-project \
  --requested-action ship \
  --runtime codex
```

## What Happens During A Run

1. resolve the target from program address or local path
2. classify support state and source availability
3. build specialist review bundles
4. run specialist reviewers
5. judge and deduplicate findings
6. emit a final risk report

## Outputs

By default artifacts are written to:

- `artifacts/reviews/<target>/resolution.json`
- `artifacts/reviews/<target>/bundle-manifest.json`
- `artifacts/reviews/<target>/specialist-findings.json`
- `artifacts/reviews/<target>/judged-risk-brief.json`
- `artifacts/reviews/<target>/report.md`

## Runtime Guidance

Use `mock` when:

- you want to test the plumbing
- you are validating bundle generation
- you do not have Codex credentials configured

Use `codex` when:

- you want to experiment with a Codex-backed specialist runtime
- you have the Codex CLI installed and authenticated

## Current Limits

- first-release coverage is Anchor-first
- verified-source resolution is the strongest supported path
- interface-level IDL review remains future work
- stage 2 hosted service flow does not exist yet
- Quick Scan, quoted audit jobs, and x402 settlement are future work
