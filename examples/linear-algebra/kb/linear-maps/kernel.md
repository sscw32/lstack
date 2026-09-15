---
id: kernel
kind: concept
status: reviewing
confidence: 3
last_studied: 2026-09-09
last_tested: 2026-09-12
last_result: 3/3
next_review: 2026-09-15
passes_in_a_row: 1
hint_count: 1
prereqs: []
sessions: [2026-09-09, 2026-09-12]
sources:
  - "axler-toc.md 3.B Null Spaces and Ranges"
---
# Kernel

## Summary
The kernel (Axler: null space) of T: V -> W is the set of vectors T sends to 0. It is a subspace of the domain V. T is injective exactly when the kernel is {0}, because T(v) = T(w) means T(v - w) = 0.

## Terms
- kernel :: the set of vectors T sends to 0
- null(T) :: Axler's notation for the kernel of T
- injective :: T(v) = T(w) implies v = w

## Analogies
- The kernel is the shadow of what T flattens away. Everything in it lands on the same point.

## Heuristics
- When asked if T is injective, check whether ker T = {0} first.
- To find a kernel, set T(v) = 0 and solve. The solution set is the kernel.

## Aha
- 2026-09-12: kernel size and injectivity are the same question.

## Open questions
- Why does dim ker T + dim range T equal dim V exactly?

## Cards
What is the kernel of a linear map T?::The set {v in V : Tv = 0}
Why is ker T a subspace of V?::T(0) = 0 puts 0 in it, T(u + v) = Tu + Tv = 0 keeps sums in it, T(av) = a Tv = 0 keeps multiples in it
How do you decide whether a linear map is injective?
?
Compute the kernel. T is injective iff ker T = {0}.
The kernel of T is a subspace of the ==domain==, not the codomain.
Given T(x, y, z) = (x + y, y + z), what is the first step to find the kernel?::Set both coordinates to 0 and solve x + y = 0, y + z = 0
