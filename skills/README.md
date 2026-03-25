# Skills

This directory defines the initial `Sealevel Guard` skill suite.

The design principle is:

- start from proven Solana-native vulnerability categories,
- keep the first release Anchor-first,
- and package outputs for agent decision-making rather than human-only review.

## Structure

- `sealevel-guard-review/SKILL.md`
  - top-level orchestrator skill
- `shared/`
  - shared rules, judging, and report formatting
- `agents/`
  - specialist agent instructions used by the orchestrator
- specialist skill directories:
  - `access-control/`
  - `pda-integrity/`
  - `account-constraints/`
  - `cpi-risk/`
  - `token-invariants/`
  - `governance-upgrade-risk/`
- `NOTICE.md`
  - attribution and license handling note

## Why this shape

Trail of Bits' Solana vulnerability scanner skill is a strong base because it
anchors the skill suite in real Sealevel-native failure modes:

- arbitrary CPI,
- improper PDA validation,
- missing ownership checks,
- missing signer checks,
- sysvar account checks,
- and improper instruction introspection.

Sealevel Guard keeps that foundation, but changes the product shape:

- from one scanner skill to a skill suite,
- from a flat skill list to an orchestrated review workflow,
- from findings-only output to agent-readable trust decisions,
- and from human review assistance to trust gating for other agents.

## First Release Scope

The first release intentionally excludes:

- full native Rust support,
- token-launch rug heuristics,
- memecoin intelligence,
- and fully generalized economic or oracle analysis.

Those can come later if they reinforce the core trust-gate thesis.
