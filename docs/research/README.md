# Research Summary

This folder captures the narrow research sprint needed before implementation.

The goal is not to produce a giant market report. The goal is to answer four
high-leverage questions:

1. What are we really competing with?
2. Who is the first buyer or caller we should optimize for?
3. How should pricing work if heavy security work is not a normal per-request API?
4. How mature is x402 for this product, and where should we lean on it vs avoid overcommitting?

## Files

- [competitors.md](./competitors.md)
- [buyers.md](./buyers.md)
- [pricing.md](./pricing.md)
- [x402-posture.md](./x402-posture.md)

## High-Level Conclusion

The current narrative is directionally right and strong enough to keep building.

The main risk is not "we are wrong about the space." The main risk is that we
accidentally describe ourselves as:

- another scanner,
- another audit chatbot,
- or another x402 pay-per-request demo.

The evidence points to a sharper position:

`Sealevel Guard` should be framed as a trust gate for agent actions on Solana,
with quoted audit jobs as the economic core and x402 as the settlement rail.

## Confidence

### High confidence

- Solana's agent ecosystem is real and visibly forming.
- x402 on Solana is real enough to use as settlement rails.
- Solana already has security scanners and adjacent audit tooling.
- Our strongest differentiation is agent-readable decision output, not raw scanning.
- Heavy security work should be quoted by codebase complexity and scope.

### Medium confidence

- The best first user segment is likely not the most visible current segment.
- Integration and treasury-style agents are likely better long-term buyers than
  generic builder agents, even if builder agents are easier to demo.
- Quick Scan is useful as a funnel, but should not dominate the business model.

### Low confidence

- Exact pricing bands for the first public release.
- Whether x402-only checkout is enough for demo and early user conversion.

## Recommended Next Move

Proceed to implementation planning.

Do not pause for broad market research.

Instead, carry forward these constraints:

1. Anchor-first.
2. Position as a trust gate, not a scanner.
3. Quote heavy jobs by complexity and scope.
4. Use x402 as settlement, but do not make it the whole product story.
5. Keep one lightweight endpoint for intake and demo simplicity.
