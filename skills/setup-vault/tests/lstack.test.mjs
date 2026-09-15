import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseCards, parseYaml, resultRatio, splitFrontmatter } from '../scripts/lstack.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(here, '..', 'scripts', 'lstack.mjs');
const FIXTURE = path.join(here, '..', '..', '..', 'examples', 'linear-algebra');
const TODAY = '2026-09-15';
const GENERATED = ['index.md', 'graph.md', 'glossary.md', 'analogies.md', 'heuristics.md', 'today.md'];

function run(cwd, ...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--today', TODAY], { cwd, encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

function scratchVault() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lstack-'));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}

const CLEAN_FINDINGS = [
  'WARN kb/vector-spaces.md: next_review 2026-09-13 is 2 days overdue',
  'WARN kb/vector-spaces/span.md: next_review 2026-09-13 is 2 days overdue',
  'WARN kb/vector-spaces/span.md: calibration gap: confidence 4 but last result 1/3',
  'INFO kb/linear-maps/rank-nullity.md: sources include agent-proposed (unverified)',
  '4 findings',
];

test('build reproduces the checked-in generated files byte for byte', () => {
  const dir = scratchVault();
  for (const f of GENERATED) fs.rmSync(path.join(dir, 'kb', f));
  const r = run(dir, 'build');
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out, GENERATED.map((f) => `wrote kb/${f}\n`).join(''));
  for (const f of GENERATED) {
    assert.equal(fs.readFileSync(path.join(dir, 'kb', f), 'utf8'), fs.readFileSync(path.join(FIXTURE, 'kb', f), 'utf8'), f);
  }
});

test('lint on the clean fixture reports only the expected warnings and exits 0', () => {
  const r = run(FIXTURE, 'lint');
  assert.equal(r.code, 0);
  assert.deepEqual(r.out.trimEnd().split('\n'), CLEAN_FINDINGS);
});

test('lint reports a duplicate id as an ERROR and exits 1', () => {
  const dir = scratchVault();
  const p = path.join(dir, 'kb', 'linear-maps', 'image.md');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('id: image', 'id: kernel'));
  const r = run(dir, 'lint');
  assert.equal(r.code, 1);
  assert.ok(r.out.includes('ERROR kb/linear-maps/kernel.md: duplicate id "kernel" (also kb/linear-maps/image.md)'), r.out);
  assert.ok(r.out.includes('ERROR kb/linear-maps/image.md: id "kernel" does not match filename "image"'), r.out);
});

test('lint reports a dangling prereq', () => {
  const dir = scratchVault();
  const p = path.join(dir, 'kb', 'vector-spaces', 'basis.md');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('prereqs: [span]', 'prereqs: [span, eigenvalues]'));
  const r = run(dir, 'lint');
  assert.equal(r.code, 1);
  assert.ok(r.out.includes('ERROR kb/vector-spaces/basis.md: prereq "eigenvalues" is not a node id'), r.out);
});

test('lint reports a prereq cycle', () => {
  const dir = scratchVault();
  const p = path.join(dir, 'kb', 'vector-spaces', 'span.md');
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('prereqs: []', 'prereqs: [rank-nullity]'));
  const r = run(dir, 'lint');
  assert.equal(r.code, 1);
  const line = r.out.split('\n').find((l) => l.includes('prereq cycle'));
  assert.ok(line, r.out);
  assert.match(line, /^ERROR kb\/.*: prereq cycle (basis -> span -> rank-nullity -> basis|span -> rank-nullity -> basis -> span|rank-nullity -> basis -> span -> rank-nullity)$/);
});

test('lint reports a folder with no sibling node file', () => {
  const dir = scratchVault();
  fs.mkdirSync(path.join(dir, 'kb', 'eigen'));
  fs.writeFileSync(path.join(dir, 'kb', 'eigen', 'eigenvalues.md'), '---\nid: eigenvalues\nkind: concept\nstatus: new\nprereqs: []\n---\n# Eigenvalues\n');
  const r = run(dir, 'lint');
  assert.equal(r.code, 1);
  assert.ok(r.out.includes('ERROR kb/eigen/: folder has no sibling eigen.md'), r.out);
});

test('lint warns about a node past new with no cards and about a bad card line', () => {
  const dir = scratchVault();
  const p = path.join(dir, 'kb', 'linear-maps', 'image.md');
  const text = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(p, `${text.slice(0, text.indexOf('## Cards'))}## Cards\njust a sentence with no card syntax\n`);
  const r = run(dir, 'lint');
  assert.equal(r.code, 0);
  assert.ok(r.out.includes('WARN kb/linear-maps/image.md: no cards'), r.out);
  assert.ok(r.out.includes('WARN kb/linear-maps/image.md: card line matches none of the four forms: just a sentence'), r.out);
});

test('lint warns about an uncited source file', () => {
  const dir = scratchVault();
  fs.writeFileSync(path.join(dir, 'sources', 'lecture-2.md'), '# Lecture 2\n');
  const r = run(dir, 'lint');
  assert.ok(r.out.includes('WARN sources/lecture-2.md: cited by no node'), r.out);
});

test('due --json orders the queue gap first, then overdue, then hints', () => {
  const r = run(FIXTURE, 'due', '--json');
  assert.equal(r.code, 0);
  const q = JSON.parse(r.out);
  assert.deepEqual(q.due.map((d) => d.id), ['span', 'vector-spaces', 'kernel', 'image']);
  assert.deepEqual(q.budget, { minutes: 45, reviews: 4, new: 0 });
  assert.deepEqual(q.never_tested.map((n) => n.id), ['basis']);
  assert.deepEqual(q.frontier, []);
  assert.deepEqual(q.blocked, [{
    id: 'rank-nullity', title: 'Rank-nullity theorem', path: 'linear-maps/rank-nullity.md',
    needs: [{ id: 'image', status: 'learning' }, { id: 'basis', status: 'learning' }],
  }]);
});

test('a proven prerequisite chain moves a node from Blocked to Frontier', () => {
  const dir = scratchVault();
  for (const rel of ['linear-maps/image.md', 'vector-spaces/basis.md']) {
    const p = path.join(dir, 'kb', rel);
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('status: learning', 'status: reviewing'));
  }
  const q = JSON.parse(run(dir, 'due', '--json').out);
  assert.deepEqual(q.blocked, []);
  assert.deepEqual(q.frontier.map((f) => f.id), ['rank-nullity']);
  assert.deepEqual(q.budget, { minutes: 45, reviews: 3, new: 1 });
});

test('usage errors exit 2', () => {
  assert.equal(run(FIXTURE, 'bogus').code, 2);
  assert.equal(run(os.tmpdir(), 'build').code, 2);
  const r = spawnSync(process.execPath, [SCRIPT, 'build', '--today', 'yesterday'], { cwd: FIXTURE, encoding: 'utf8' });
  assert.equal(r.status, 2);
});

test('version prints .lstack/VERSION', () => {
  assert.equal(run(FIXTURE, 'version').out, '0.1.0\n');
});

test('the example vault carries the same .lstack files that setup-vault installs', () => {
  const refs = path.join(here, '..', 'references');
  assert.equal(fs.readFileSync(path.join(FIXTURE, '.lstack', 'lstack.mjs'), 'utf8'), fs.readFileSync(SCRIPT, 'utf8'));
  for (const f of ['node-schema.md', 'card-writing.md']) {
    assert.equal(fs.readFileSync(path.join(FIXTURE, '.lstack', f), 'utf8'), fs.readFileSync(path.join(refs, f), 'utf8'), f);
  }
});

test('parseCards recognises the four Obsidian forms and flags stray lines', () => {
  const { cards, bad } = parseCards([
    'What is x::y',
    'A:::B',
    'Question line one',
    'line two',
    '?',
    'answer',
    '',
    'The ==hidden== word <!--SR:!2026-09-20,3,250-->',
    'Reversible multi',
    '??',
    'back',
    '',
    'stray sentence',
  ]);
  assert.deepEqual(cards.map((c) => c.form), ['single', 'reversible', 'multi', 'cloze', 'multi-reversible']);
  assert.deepEqual(bad, ['stray sentence']);
});

test('resultRatio reads n/m, pass, fail, gave-up, and null', () => {
  assert.equal(resultRatio('1/3'), 1 / 3);
  assert.equal(resultRatio('pass'), 1);
  assert.equal(resultRatio('fail'), 0);
  assert.equal(resultRatio('gave-up'), 0);
  assert.equal(resultRatio(null), null);
});

test('parseYaml handles scalars, inline lists, block lists, and one nested map', () => {
  const y = parseYaml('lstack: 0.1.0\nn: 3\nf: 0.67\nd: 2026-09-15\nq: "a: b"\ninline: [a, 2, "c"]\nblock:\n  - one\n  - "two"\nmap:\n  k: v\n  z: null\nempty: []\n');
  assert.deepEqual(y, { lstack: '0.1.0', n: 3, f: 0.67, d: '2026-09-15', q: 'a: b', inline: ['a', 2, 'c'], block: ['one', 'two'], map: { k: 'v', z: null }, empty: [] });
  assert.deepEqual(splitFrontmatter('---\nid: x\n---\n# X\n'), { fm: { id: 'x' }, body: '# X\n' });
  assert.deepEqual(splitFrontmatter('# no frontmatter\n'), { fm: null, body: '# no frontmatter\n' });
});
