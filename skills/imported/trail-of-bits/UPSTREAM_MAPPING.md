# Upstream Mapping

This file maps Trail of Bits Solana scanner categories into Sealevel Guard's
specialist skill layout.

## Upstream Category -> Sealevel Guard Mapping

### Arbitrary CPI

- maps to:
  - `cpi-risk`

### Improper PDA Validation

- maps to:
  - `pda-integrity`

### Missing Ownership Check

- maps to:
  - `account-constraints`

### Missing Signer Check

- maps to:
  - `access-control`

### Sysvar Account Check

- maps to:
  - `cpi-risk`
  - and potentially a future `instruction-introspection` specialist

### Improper Instruction Introspection

- maps to:
  - `cpi-risk`
  - and potentially a future `instruction-introspection` specialist

## Product Difference

Trail of Bits organizes these as scanner logic.

Sealevel Guard reorganizes them into:

- specialist trust surfaces
- orchestrated review workflow
- deduplicated findings
- and a final action-level trust decision
