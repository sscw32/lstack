---
id: linear-maps
kind: concept
status: reviewing
confidence: 3
last_studied: 2026-09-07
last_tested: 2026-09-14
last_result: 3/3
next_review: 2026-09-21
passes_in_a_row: 2
hint_count: 0
prereqs: []
sessions: [2026-09-07, 2026-09-10, 2026-09-14]
sources:
  - "axler-toc.md 3.A The Vector Space of Linear Maps"
---
# Linear maps

## Summary
A linear map T: V -> W is a function that respects both operations: T(u + v) = Tu + Tv and T(av) = a Tv. That is the entire definition. A linear map is determined by what it does to a basis of V, and you can choose those values freely. Matrices are linear maps written in chosen bases, not the other way around.

## Terms
- linear map :: a function between vector spaces that preserves addition and scalar multiplication
- L(V, W) :: the set of all linear maps from V to W, itself a vector space
- additivity :: T(u + v) = Tu + Tv
- homogeneity :: T(av) = a Tv

## Analogies
- A linear map is a machine that doesn't care whether you add inputs before or after feeding them in.

## Heuristics
- To define a linear map, say where a basis goes. Everything else is forced.
- To show a map is not linear, check T(0) = 0 first. Many non-examples fail there.

## Aha
- 2026-09-10: "linear means the map respects the two operations, nothing else"

## Open questions

## Cards
State the two conditions that make T: V -> W linear.::Additivity, T(u + v) = Tu + Tv, and homogeneity, T(av) = a Tv
Why does a linear map send 0 to 0?::T(0) = T(0 times 0) = 0 times T(0) = 0
Is T(x, y) = (x + 1, y) linear?
?
No. T(0, 0) = (1, 0), which is not 0, so additivity fails.
A linear map is completely determined by its values on a ==basis== of the domain.
What is L(V, W)?::The vector space of all linear maps from V to W
