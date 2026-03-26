---
name: pda-integrity
description: Detects whether a program's PDA design allows spoofing, role confusion, or weak authority derivation. Internal specialist module for PDA integrity review.
user-invocable: false
---

# PDA Integrity

> Forked from Trail of Bits Solana security skills.
> Original category alignment: improper PDA validation.
> Modified by Sealevel Guard and distributed as skill text under CC BY-SA 4.0.

Program-derived address integrity review skill.

## Purpose

Detect whether a program's PDA design allows spoofing, role confusion, or weak
authority derivation.

## Focus

This skill is responsible for:

- insecure seed design,
- improper PDA validation,
- bump and derivation assumptions,
- account-role confusion through PDA reuse,
- and authority spoof paths based on derived accounts.

## What To Look For

- PDAs derived from attacker-influenced or weakly-bound seeds
- derivation logic that does not tie authority to stable state
- code that trusts a PDA-shaped account without validating the intended role
- reuse of the same PDA pattern across incompatible trust boundaries
- assumptions that a PDA is safe merely because it is derived

## Anchor-Specific Heuristics

- account constraints that imply PDA safety without proving it
- handlers that accept accounts whose seeds or bumps are not validated tightly
- config or vault authorities whose derivation is too permissive

## Output Shape

For each finding, explain:

- the expected role of the PDA,
- how the derivation or validation is weak,
- the likely exploit path,
- and the impact on trust decisions.

## Example Finding Themes

- attacker-controlled seed component
- PDA role confusion between config and vault authority
- unverified bump or derivation assumption
- derived authority not bound to immutable configuration
