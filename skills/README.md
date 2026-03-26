# Skills

This directory defines the initial `Sealevel Guard` skill suite.

## Licensing

This repository uses split licensing:

- code and scripts are licensed under `MIT`
- designated skill text in this directory is licensed under `CC BY-SA 4.0`

The specialist skill text most directly forked from Trail of Bits Solana
security skills is:

- `access-control`
- `pda-integrity`
- `account-constraints`
- `cpi-risk`

These files are adapted from the public Trail of Bits Solana vulnerability
scanner materials and should be treated as `CC BY-SA 4.0`.

Reference:

- `https://skills.sh/trailofbits/skills/solana-vulnerability-scanner`
- [LICENSE-CC-BY-SA-4.0.md](./LICENSE-CC-BY-SA-4.0.md)

## Installation

To use the `sealevel-guard-review` skill, add it to your Claude Code configuration:

1. Copy the skill directory to your Claude skills folder, or
2. Reference the skill directly from your local filesystem

The skill will be available as: `/sealevel-guard:sealevel-guard-review`

## Usage

### Review an On-Chain Program

Review a Solana program by its on-chain address:

```
/sealevel-guard:sealevel-guard-review TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623TQ5rt
```

### Review a Local Program

Review a local Solana program by its path:

```
/sealevel-guard:sealevel-guard-review ./my-anchor-program
/sealevel-guard:sealevel-guard-review <program-address>
```

### What It Does

The skill performs a parallelized trust-gate review to determine whether a Solana program is safe enough to:
- **ship** - deploy to production
- **integrate** - connect with other systems
- **allocate** - allocate capital through

The design principle is:

- start from proven Solana-native vulnerability categories,
- keep the first release Anchor-first,
- and package outputs for agent decision-making rather than human-only review.

## Structure

- `sealevel-guard-review/SKILL.md`
  - top-level orchestrator skill
- `HOW_TO_USE.md`
  - operator-facing usage flow and runtime entrypoints
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

## Using The Suite

If you are operating Sealevel Guard as a local runtime package, start with:

- [HOW_TO_USE.md](./HOW_TO_USE.md)

If you are integrating or extending specialist prompts, start with:

- `sealevel-guard-review/SKILL.md`
