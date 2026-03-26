---
name: governance-upgrade-risk
description: Detects whether governance or upgrade control is concentrated, weakly separated, or capable of undermining user or integrator trust. Internal specialist module for governance risk review.
user-invocable: false
---

# Governance Upgrade Risk

Governance and upgradeability trust review skill.

## Purpose

Detect whether governance or upgrade control is concentrated, weakly separated,
or capable of undermining user or integrator trust.

## Focus

This skill is responsible for:

- single-key upgrade authority concentration,
- emergency admin abuse surface,
- governance bypass paths,
- unsafe config authority patterns,
- and migration or initialization flows that weaken trust.

## What To Look For

- upgrade power held by an unsafe authority structure
- governance assumptions not matched by enforced control
- emergency powers that can bypass trust assumptions silently
- initialization or migration paths that can rewrite critical state

## Output Shape

Each finding should state:

- what trust assumption governance appears to promise,
- how actual control differs,
- and whether another agent should refuse to integrate or allocate through it.