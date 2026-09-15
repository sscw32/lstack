# Writing cards

Cards live under `## Cards` in a node. The syntax is the Obsidian Spaced Repetition plugin's, so a vault opened in Obsidian reviews the same cards.

## Syntax

- Single line: `Question::Answer`
- Reversible: `A:::B`
- Multi-line: question lines, then a line containing only `?`, then answer lines, then a blank line. Reversible multi-line uses `??`.
- Cloze: `==hidden text==` inside a sentence.
- The plugin appends `<!--SR:!date,interval,ease-->` after cards it schedules. Leave those comments alone.

## Rubric

- One idea per card. No yes/no questions. No card whose answer is a verbatim sentence from the Summary.
- Concept nodes get at least two cards with different lenses: definition, contrast with a neighbour, when to use it, a consequence.
- Procedure nodes get at least one "given this input, what's the first step" card.
- Five to fifteen cards per node. If you can't write two, the node is probably a `fact`.
- Every card the agent proposes goes through show-before-write.

## Examples

Good:

```
Why is span(v1, ..., vm) a subspace?::0 is the trivial combination, and sums and scalar multiples of combinations are combinations
Given (1, 0), (0, 1), (1, 1) in R^2, what is the first thing you check?::The count. Three vectors in a two-dimensional space are dependent.
A list containing the zero vector is always linearly ==dependent==.
```

Bad, and why:

```
Is the kernel a subspace?::Yes                          (yes/no; nothing retrieved)
What is a basis?::A basis of V is a list that is both linearly independent and spanning.   (verbatim Summary sentence)
Define kernel, image, and rank-nullity.::...           (three ideas in one card)
```
