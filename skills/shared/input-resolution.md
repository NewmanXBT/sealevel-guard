# Input Resolution

Sealevel Guard is `program_address-first`.

The orchestrator should not assume source code is available up front.

## Primary Input

- `program_address`

## Resolution Pipeline

First release implementation follows the official verified-build path:

1. program account metadata
2. verified-build metadata
3. verified source snapshot

## Resolution States

### `verified_source_available`

Use when:

- the program address can be linked to verified source metadata and source code

Review posture:

- full source-level review allowed

### `metadata_only`

Use when:

- only program metadata is available
- no trusted source snapshot or IDL is available

Review posture:

- very limited review
- confidence must be constrained
- recommendation should usually be `warn` or `unsupported`

### `unsupported`

Use when:

- the address does not resolve into a credible Solana program review context

Review posture:

- stop and return `unsupported`

## Future TODO

Interface-level review from on-chain IDL is not part of the first implemented
path.

If added later, it should become an explicit secondary branch after program
metadata resolution, not a silently implied capability.

## Product Rule

Do not pretend that a bare Solana program address always implies source-level
auditability.

Address-first is correct.
Verified-source-first execution is the current implementation boundary.
