# Imported Trail of Bits Materials

This directory is reserved for Trail of Bits-derived Solana skill materials.

The intent is:

- keep Sealevel Guard's orchestrator and trust-gate product structure as our own
- while explicitly tracking any imported or adapted upstream materials used in
  specialist skill development

## Why This Exists

Trail of Bits' Solana vulnerability scanner skill covers real and useful
Sealevel-native categories, including:

- arbitrary CPI
- improper PDA validation
- missing ownership checks
- missing signer checks
- sysvar trust issues
- instruction introspection issues

Those categories are a strong base for our specialist skill design.

## Current Status

At the moment, this directory stores:

- attribution metadata
- license notes
- intended mapping between upstream categories and Sealevel Guard specialists

It does **not** yet include copied upstream skill text.

That keeps the repo clean while we decide whether to:

- reference upstream only,
- or import/adapt upstream text directly under the required license terms.

## Upstream Reference

- Repository: `trailofbits/skills`
- Relevant skill:
  `plugins/building-secure-contracts/skills/solana-vulnerability-scanner`

## License Posture

If upstream text is imported here in the future:

- preserve attribution
- preserve modification notice
- preserve share-alike obligations

See:

- [ATTRIBUTION.md](./ATTRIBUTION.md)
- [LICENSE.md](./LICENSE.md)
- [UPSTREAM_MAPPING.md](./UPSTREAM_MAPPING.md)
