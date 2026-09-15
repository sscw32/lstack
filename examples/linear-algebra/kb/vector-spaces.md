---
id: vector-spaces
kind: concept
status: reviewing
confidence: 3
last_studied: 2026-09-03
last_tested: 2026-09-10
last_result: 3/3
next_review: 2026-09-13
passes_in_a_row: 1
hint_count: 0
prereqs: []
sessions: [2026-09-01, 2026-09-03, 2026-09-10]
sources:
  - "axler-toc.md 1.B Definition of Vector Space"
  - "axler-toc.md 1.C Subspaces"
---
# Vector spaces

## Summary
A vector space is a set with two operations, addition and scalar multiplication, that obey the usual rules (commutative, associative, identity, inverses, distributive). The rules are the whole definition. Nothing about arrows or coordinates is required. A subspace is a subset that is itself a vector space under the same operations, which reduces to three checks: contains 0, closed under addition, closed under scaling.

## Why it matters
Every later object (span, basis, kernel, image) is a subspace or lives inside one. If you cannot check the three subspace conditions quickly, every later proof stalls at step one.

## Terms
- vector space :: a set with addition and scalar multiplication satisfying the vector space axioms
- subspace :: a subset that contains 0 and is closed under addition and scalar multiplication
- F :: the field of scalars, R or C in Axler

## Analogies
- A vector space is a game board with two legal moves. A subspace is a region you can never leave using those moves.

## Heuristics
- To show a set is a subspace, check 0 first. Most non-examples fail there.
- To show a set is not a subspace, find one pair whose sum leaves the set, or one vector whose negative leaves it.

## Aha
- 2026-09-03: functions R -> R form a vector space. Vectors don't have to be lists of numbers.

## Open questions
- Why does Axler insist on F being only R or C?

## Cards
What are the three conditions for a subset U of V to be a subspace?::U contains 0, U is closed under addition, U is closed under scalar multiplication
Give a subset of R^2 that is closed under addition but is not a subspace.::The set of vectors with non-negative coordinates. It is closed under addition but -1 times (1, 0) leaves it.
Is the set of polynomials with p(3) = 0 a subspace of P(R)?
?
Yes. The zero polynomial has p(3) = 0, sums of such polynomials still vanish at 3, and scaling preserves the zero.
The additive identity of a vector space is ==unique==.
Why does a vector space need an additive inverse for every element?::So subtraction is defined, which is what makes solving v + x = w possible for every v and w
