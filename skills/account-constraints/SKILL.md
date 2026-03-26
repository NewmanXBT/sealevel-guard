---
name: account-constraints
description: Detects whether the program trusts the wrong accounts, owners, or mutability assumptions. Internal specialist module for Anchor account validation review.
user-invocable: false
---

# Account Constraints

> Forked from Trail of Bits Solana security skills.
> Original category alignment: missing ownership checks.
> Modified by Sealevel Guard and distributed as skill text under CC BY-SA 4.0.

Anchor account-validation and account-relationship review skill.

## Purpose

Detect whether the program trusts the wrong accounts, the wrong owners, or the
wrong mutability assumptions.

## Focus

This skill is responsible for:

- missing ownership checks,
- discriminator and account-type validation issues,
- incorrect mutability assumptions,
- unsafe remaining accounts usage,
- and account relationship mismatches.

## What To Look For

- accounts accepted without validating expected owner or role
- handlers that rely on type assumptions not enforced by constraints
- mutable accounts passed where immutability should be enforced
- remaining accounts used as an untrusted side channel
- token program or associated token program assumptions not validated

## Anchor-Specific Heuristics

- weak `AccountInfo` handling
- implicit trust in `remaining_accounts`
- account structs whose constraints do not match the handler's authority model
- owner checks that are implied but not enforced

## Output Shape

Each finding should state:

- which account relationship is being trusted,
- what validation is missing,
- what wrong account could be substituted,
- and why that matters to a downstream agent's trust decision.

## Example Finding Themes

- missing owner validation on critical account
- unsafe mutable account acceptance
- unchecked remaining accounts path
- wrong token program trust assumption
