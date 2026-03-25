# Access Control

Solana and Anchor access-control review skill.

## Purpose

Detect whether privileged behavior is exposed to the wrong signer, authority, or
account path.

## Focus

This skill is responsible for:

- missing signer checks,
- weak admin or authority transitions,
- privileged instruction exposure,
- upgrade authority concentration,
- and misuse of authority-bearing accounts.

## What To Look For

- instructions that mutate state or move value without a strong signer check
- authority changes that can be triggered by the wrong actor
- admin roles inferred from mutable accounts rather than enforced checks
- upgrade or governance powers concentrated in unsafe ways
- mismatches between intended authority and actual validated authority

## Anchor-Specific Heuristics

- accounts expected to be privileged but not constrained tightly enough
- incorrect `has_one` assumptions
- weak or missing authority checks across instruction handlers
- mutable config or vault authorities without robust validation

## Output Shape

When reporting a finding, include:

- affected instruction or account path
- why the privilege boundary is weak
- who could exploit it
- what action becomes possible
- and whether it is a `ship_blocker`

## Example Finding Themes

- unauthorized admin update
- vault authority confusion
- missing signer gate on privileged instruction
- unsafe upgrade or emergency authority concentration
