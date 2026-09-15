---
id: image
kind: concept
status: learning
confidence: 2
last_studied: 2026-09-11
last_tested: 2026-09-14
last_result: 1/3
next_review: 2026-09-15
passes_in_a_row: 0
hint_count: 0
prereqs: []
sessions: [2026-09-11, 2026-09-14]
sources:
  - "axler-toc.md 3.B Null Spaces and Ranges"
---
# Image

## Summary
The image (Axler: range) of T: V -> W is the set of all outputs {Tv : v in V}. It is a subspace of the codomain W. T is surjective exactly when the image is all of W. For a matrix, the image is the span of the columns. (agent draft)

## Terms
- image :: the set of all outputs of T
- range(T) :: Axler's notation for the image of T
- surjective :: image equals the whole codomain

## Analogies
- The image is the set of places the machine can actually produce, regardless of what you feed it.

## Heuristics
- To find the image of a matrix, take the span of its columns.
- Kernel lives in the domain, image lives in the codomain. Say which space you are in before computing.

## Aha

## Open questions
- Is the image of a subspace under T always a subspace of W?

## Cards
What is the image of a linear map T: V -> W?::The set {Tv : v in V}, a subspace of W
Why is range T a subspace of W?::0 = T(0) is in it, Tu + Tv = T(u + v) keeps sums in it, a Tv = T(av) keeps multiples in it
For a matrix A, the image of the map v -> Av is the span of the ==columns== of A.
When is T surjective?::When range T = W
Given the matrix with columns (1, 0) and (2, 0), what is the first step to find the image?::Take the span of the columns. Here both are multiples of (1, 0), so the image is the x-axis.
