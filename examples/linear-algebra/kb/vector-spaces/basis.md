---
id: basis
kind: concept
status: learning
confidence: 2
last_studied: 2026-09-08
last_tested: null
last_result: null
next_review: null
passes_in_a_row: 0
hint_count: 0
prereqs: [span]
sessions: [2026-09-08]
sources:
  - "axler-toc.md 2.B Bases"
  - "axler-toc.md 2.C Dimension"
---
# Basis

## Summary
A basis of V is a list that is both linearly independent and spanning. Every vector then has exactly one expression as a combination of the basis. All bases of a finite-dimensional space have the same length, and that length is the dimension. (agent draft)

## Terms
- basis :: a linearly independent spanning list
- dimension :: the length of any basis of a finite-dimensional space

## Analogies
- A basis is a coordinate system with no redundant axes and no missing ones.

## Heuristics
- To turn a spanning list into a basis, throw out vectors that are in the span of the earlier ones.
- To turn an independent list into a basis, keep adding vectors outside the current span.

## Aha

## Open questions
- Why do all bases have the same length? Which lemma does the proof lean on?

## Cards
What two properties make a list a basis?::Linearly independent and spanning
Why does a basis give unique coordinates?::If two combinations give the same vector, subtracting them gives a combination equal to 0, and independence forces all coefficients to agree
Every spanning list in a finite-dimensional space can be ==reduced== to a basis.
Every linearly independent list in a finite-dimensional space can be ==extended== to a basis.
Which is larger in a finite-dimensional space, the length of an independent list or the length of a spanning list?::The spanning list is at least as long as the independent list
