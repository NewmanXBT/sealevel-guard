# Pricing Research

## Question

How should Sealevel Guard price security work if heavy audits are not normal
pay-per-request API calls?

## Executive Takeaway

The evidence strongly supports the strategy already emerging in the docs:

- `per-request pricing` is fine for lightweight intake
- `quoted jobs` should be the core model for serious security work

This is not only a product preference. It follows directly from how audit costs
work in practice.

## What Existing Sources Say

### 1. Smart contract audits are generally priced by complexity, not by calls

Multiple market references and vendor-style explainers converge on the same
drivers:

- lines of code,
- logical complexity,
- language and chain specialization,
- urgency,
- external dependencies,
- and scope of review.

Representative references:

- TechTarget summary:
  https://www.techtarget.com/searchsecurity/tip/How-to-conduct-a-smart-contract-audit-and-why-its-needed
- Sherlock market reference:
  https://sherlock.xyz/post/smart-contract-audit-pricing-a-market-reference-for-2026
- Assure DeFi process and pricing explainer:
  https://www.assuredefi.com/blog/smart-contract-audits-pricing-process-and-choosing-the-right-partner

Even when exact price ranges differ, the structure is consistent: audits are
scoped and quoted, not charged like generic micro-API usage.

### 2. Solana and Rust security work is treated as more specialized

Some public market references explicitly state that Solana / Rust audits are
usually more expensive than common Solidity work because the talent and tooling
pool is smaller.

Example:

- Zealynx pricing reference:
  https://www.zealynx.io/blogs/audit-pricing-2026

Use carefully:

- this is not a primary-source truth we should put at the center of the pitch,
- but it supports the idea that Solana-specific security work deserves
  complexity-aware pricing.

### 3. Existing Solana scanner products still feel like scoped security products

sec3 X-Ray is not framed as "cheap generic endpoint calls." It is framed as a
security scanner with CI integration, dashboards, reports, and paid plans.

Reference:

- https://doc.sec3.dev/

This reinforces the idea that security products in this category are bought as
workflows or scoped capabilities, not just metered raw requests.

## Why Per-Request Pricing Fails For Us

If Sealevel Guard priced full audits as simple API calls, we would inherit the
wrong unit economics.

Heavy cost drivers include:

- larger repos,
- more programs,
- Anchor vs native Rust differences,
- more selected skills,
- more deduplication and evidence generation,
- and higher-depth output artifacts.

This means the cost curve is tied to `work scope`, not `HTTP count`.

## What x402 Docs Tell Us

QuickNode's own x402 docs are useful here because they explicitly separate:

- x402 `pay per request` access
- and standard production plans

Their docs say x402 on QuickNode is currently in `alpha`, and frame it as best
for agents, prototyping, and permissionless access, while standard plans carry
production SLA expectations.

Reference:

- https://www.quicknode.com/docs/build-with-ai/x402-payments

Interpretation:

- x402 is credible as a payment rail,
- but per-request metering is not automatically the right production business
  model for every service category.

## Recommended Model

## Layer 1: Quick Scan

Purpose:

- low-friction intake
- rough complexity band
- support / unsupported
- "should I escalate?"

Pricing:

- fixed low fee
- acceptable to charge per request

Why:

- low compute and low risk
- useful top-of-funnel product

## Layer 2: Quoted Audit

Purpose:

- real security work
- selected skill bundle
- structured risk brief
- optional remediation context

Pricing:

- quote by codebase complexity and scope

Why:

- aligns revenue with cost
- easier to explain to buyers
- protects margin on large or complex repos

## Layer 3: Deep Audit / Premium Review

Purpose:

- more reasoning depth
- richer evidence and remediation
- higher-confidence output

Pricing:

- quoted premium tier

Why:

- preserves room for better service and higher-value buyers

## Proposed Complexity Inputs

These are the inputs the estimate system should use:

- repo size / LOC band
- number of Solana programs
- framework type: Anchor or native Rust
- selected skill count
- output package requested
- requested depth

Optional future inputs:

- CPI density
- account graph complexity
- upgradeability / governance presence
- external dependency count

## Proposed Banding

### Tier 1

- single Anchor program
- modest codebase
- standard skill bundle

### Tier 2

- multiple programs or heavier Anchor usage
- more account and CPI complexity

### Tier 3

- native Rust support
- unusual layouts
- multi-program complexity
- richer custom logic and integrations

## Hard-Reject Or Soft-Reject Rules

To preserve margin, estimate should classify:

- unsupported repo format
- no detectable Solana program
- too-large codebase for current tier
- native Rust when not yet supported
- expired quote

These should not be silent failures.

## What To Say Publicly

Say:

- "quoted by codebase complexity and selected audit scope"

Do not say:

- "pay per request audit API"

The first sounds like serious security infrastructure.
The second sounds like a cheap commodity endpoint.

## Research Conclusion

The pricing thesis in the current docs is correct.

What remains is not more philosophical debate. It is implementation detail:

- define complexity bands,
- define reject rules,
- define which outputs belong in which tier.
