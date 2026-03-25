# Token Invariants

Token flow and vault invariant review skill.

## Purpose

Detect whether token and vault logic can violate the economic or accounting
assumptions another agent would rely on.

## Focus

This skill is responsible for:

- mint and burn authority issues,
- withdrawal control failures,
- accounting drift,
- redemption mismatch,
- fee logic mismatch,
- and vault balance or share inconsistency.

## What To Look For

- token supply changes without robust authority checks
- withdrawal paths that do not match accounting assumptions
- fee or redemption math that can create trust-breaking imbalance
- vault logic that trusts stale or weakly-bound state

## Output Shape

Each finding should explain:

- what invariant the system seems to promise,
- how code can violate it,
- and why a downstream agent should treat that as a trust concern.
