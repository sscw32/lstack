---
id: span
kind: concept
status: learning
confidence: 4
last_studied: 2026-09-05
last_tested: 2026-09-12
last_result: 1/3
next_review: 2026-09-13
passes_in_a_row: 0
hint_count: 2
prereqs: []
sessions: [2026-09-03, 2026-09-05, 2026-09-12]
sources:
  - "axler-toc.md 2.A Span and Linear Independence"
---
# Span

## Summary
The span of a list v1, ..., vm is the set of all linear combinations a1 v1 + ... + am vm. It is always a subspace, and it is the smallest subspace containing the list. A list spans V when its span equals V. A list is linearly independent when the only combination giving 0 has every coefficient 0.

## Terms
- span :: the set of all linear combinations of a list of vectors
- spanning list :: a list whose span is the whole space
- linearly independent :: only the trivial combination gives 0
- linearly dependent :: some non-trivial combination gives 0

## Analogies
- Span is everywhere you can reach by walking along the given directions for any distance, forwards or backwards.

## Heuristics
- To test independence, set the combination to 0 and see if the coefficients are forced to 0.
- A list with more vectors than the dimension of the space is dependent. Count first.

## Aha
- 2026-09-05: span is a set, "spanning" is a property of a list. I kept using one word for both.

## Open questions
- Is the span of the empty list {0} by convention or by the definition?

## Cards
What is span(v1, ..., vm)?::The set of all linear combinations a1 v1 + ... + am vm with scalars ai in F
Why is span(v1, ..., vm) a subspace?::0 is the combination with all coefficients 0, sums of combinations are combinations, and scaling a combination gives a combination
When is a list v1, ..., vm linearly independent?::When a1 v1 + ... + am vm = 0 forces a1 = ... = am = 0
The span of a list is the ==smallest== subspace containing every vector in the list.
A list containing the zero vector is always linearly ==dependent==.
Given (1, 0), (0, 1), (1, 1) in R^2, what is the first thing you check before computing anything?::The count. Three vectors in a two-dimensional space are dependent.
