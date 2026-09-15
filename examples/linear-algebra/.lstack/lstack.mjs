#!/usr/bin/env node
// lstack build script. Node 18+, no dependencies. Copied into a vault as .lstack/lstack.mjs.
// Shapes:
//   Vault   { root, config, today, nodes: Node[] (tree order), byId: Map<id, Node>, folderErrors: string[] }
//   Node    { id, title, rel, file, parent, depth, children: Node[], fm, sections: Map<lower, {name, lines}>, cards: Card[], badCards: string[] }
//   Card    { form: 'single' | 'reversible' | 'multi' | 'multi-reversible' | 'cloze' }
//   Finding { level: 'ERROR' | 'WARN' | 'INFO', path, message }
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { pathToFileURL } from 'node:url';

const GENERATED = ['index.md', 'graph.md', 'glossary.md', 'analogies.md', 'heuristics.md', 'today.md'];
const STATUS_ORDER = { new: 0, learning: 1, reviewing: 2, mastered: 3 };
const DEFAULTS = {
  scheduling: { ladder_days: [1, 3, 7, 16, 35], pass_threshold: 0.67, delayed_min_days: 1, mastered_after_passes: 3 },
  schedule: { sessions_per_week: 4, minutes_per_session: 45 },
  node_sections: ['Summary', 'Why it matters', 'Terms', 'Analogies', 'Heuristics', 'Aha', 'Open questions', 'Cards'],
};

// ---------- minimal YAML ----------
function scalar(raw) {
  const v = raw.trim();
  if (v === '' || v === 'null' || v === '~') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return Number(v);
  if (/^-?\d+\.\d+$/.test(v)) return Number(v);
  if (/^"(.*)"$/.test(v) || /^'(.*)'$/.test(v)) return v.slice(1, -1);
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    return inner === '' ? [] : inner.split(',').map((s) => scalar(s));
  }
  return v;
}

function parseYaml(text) {
  const out = {};
  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    i += 1;
    if (!line.trim() || line.trim().startsWith('#') || /^\s/.test(line)) continue;
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rest] = m;
    const value = rest.replace(/\s+#.*$/, '');
    if (value !== '') { out[key] = scalar(value); continue; }
    const items = [];
    const map = {};
    let isMap = false;
    while (i < lines.length && (/^\s+\S/.test(lines[i]) || !lines[i].trim())) {
      const l = lines[i];
      i += 1;
      if (!l.trim()) continue;
      const li = l.match(/^\s*-\s*(.*)$/);
      if (li) { items.push(scalar(li[1])); continue; }
      const mi = l.match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
      if (mi) { isMap = true; map[mi[1]] = scalar(mi[2].replace(/\s+#.*$/, '')); }
    }
    out[key] = isMap ? map : items;
  }
  return out;
}

function splitFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return { fm: null, body: text };
  const end = lines.indexOf('---', 1);
  if (end === -1) return { fm: null, body: text };
  return { fm: parseYaml(lines.slice(1, end).join('\n')), body: lines.slice(end + 1).join('\n') };
}

// ---------- dates ----------
const dayMs = 86400000;
function toUtc(d) { const [y, m, dd] = d.split('-').map(Number); return Date.UTC(y, m - 1, dd); }
function daysBetween(from, to) { return Math.round((toUtc(to) - toUtc(from)) / dayMs); }
function isoToday() { return new Date().toISOString().slice(0, 10); }

// ---------- nodes ----------
function parseCards(lines) {
  const cards = [];
  const bad = [];
  let buffer = [];
  let i = 0;
  const flush = () => { for (const b of buffer) bad.push(b); buffer = []; };
  while (i < lines.length) {
    const raw = lines[i].replace(/<!--SR:.*?-->/g, '').trimEnd();
    i += 1;
    if (!raw.trim()) { flush(); continue; }
    if (raw === '?' || raw === '??') {
      if (buffer.length === 0) { bad.push(raw); continue; }
      const answer = [];
      while (i < lines.length && lines[i].trim()) { answer.push(lines[i]); i += 1; }
      if (answer.length === 0) { flush(); bad.push(raw); continue; }
      cards.push({ form: raw === '?' ? 'multi' : 'multi-reversible' });
      buffer = [];
      continue;
    }
    if (raw.includes(':::')) { flush(); cards.push({ form: 'reversible' }); continue; }
    if (raw.includes('::')) { flush(); cards.push({ form: 'single' }); continue; }
    if (/==[^=]+==/.test(raw)) { flush(); cards.push({ form: 'cloze' }); continue; }
    buffer.push(raw);
  }
  flush();
  return { cards, bad };
}

function parseNode(rel, text) {
  const { fm, body } = splitFrontmatter(text);
  const lines = body.split(/\r?\n/);
  const sections = new Map();
  let title = null;
  let current = null;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      current = { name: line.slice(3).trim(), lines: [] };
      sections.set(current.name.toLowerCase(), current);
    } else if (current) current.lines.push(line);
    else if (title === null && line.startsWith('# ')) title = line.slice(2).trim();
  }
  const cardsSection = sections.get('cards');
  const { cards, bad } = cardsSection ? parseCards(cardsSection.lines) : { cards: [], bad: [] };
  const file = path.basename(rel, '.md');
  const dir = path.dirname(rel);
  return {
    id: fm && fm.id != null ? String(fm.id) : file,
    file,
    title: title || file,
    rel,
    parent: dir === '.' ? null : path.basename(dir),
    depth: dir === '.' ? 0 : dir.split('/').length,
    children: [],
    fm: fm || {},
    hasFrontmatter: fm !== null,
    sections,
    cards,
    badCards: bad,
  };
}

function walkKb(kbRoot, dir, depth, folderErrors) {
  const abs = path.join(kbRoot, dir);
  const entries = fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md') && !(depth === 0 && GENERATED.includes(e.name)));
  const dirs = new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name));
  const nodes = [];
  for (const f of files) {
    const rel = dir === '.' ? f.name : `${dir}/${f.name}`;
    const node = parseNode(rel, fs.readFileSync(path.join(abs, f.name), 'utf8'));
    const childDir = f.name.slice(0, -3);
    if (dirs.has(childDir)) {
      node.children = walkKb(kbRoot, dir === '.' ? childDir : `${dir}/${childDir}`, depth + 1, folderErrors);
      dirs.delete(childDir);
    }
    nodes.push(node);
  }
  for (const d of dirs) {
    const rel = dir === '.' ? d : `${dir}/${d}`;
    folderErrors.push(`kb/${rel}/`);
    nodes.push(...walkKb(kbRoot, rel, depth + 1, folderErrors));
  }
  return nodes;
}

function flatten(nodes, out = []) { for (const n of nodes) { out.push(n); flatten(n.children, out); } return out; }

function findVaultRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'lstack.yaml'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

function loadVault(root, today) {
  const raw = parseYaml(fs.readFileSync(path.join(root, 'lstack.yaml'), 'utf8'));
  const config = {
    ...raw,
    scheduling: { ...DEFAULTS.scheduling, ...(raw.scheduling || {}) },
    schedule: { ...DEFAULTS.schedule, ...(raw.schedule || {}) },
    node_sections: Array.isArray(raw.node_sections) && raw.node_sections.length ? raw.node_sections : DEFAULTS.node_sections,
  };
  const folderErrors = [];
  const kbRoot = path.join(root, 'kb');
  const tree = fs.existsSync(kbRoot) ? walkKb(kbRoot, '.', 0, folderErrors) : [];
  const nodes = flatten(tree);
  const byId = new Map();
  for (const n of nodes) if (!byId.has(n.id)) byId.set(n.id, n);
  return { root, config, today, tree, nodes, byId, folderErrors };
}

// ---------- scheduling state (pure) ----------
function resultRatio(r) {
  if (r == null) return null;
  const s = String(r);
  if (s === 'pass') return 1;
  if (s === 'fail' || s === 'gave-up') return 0;
  const m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  return m && Number(m[2]) > 0 ? Number(m[1]) / Number(m[2]) : null;
}

function proven(node) { return node && STATUS_ORDER[node.fm.status] >= STATUS_ORDER.reviewing; }

function nodeState(node, vault) {
  const fm = node.fm;
  const ratio = resultRatio(fm.last_result);
  const gap = fm.confidence != null && fm.confidence >= 3 && ratio != null && ratio < vault.config.scheduling.pass_threshold;
  const due = fm.next_review != null && daysBetween(String(fm.next_review), vault.today) >= 0;
  const overdue = due ? daysBetween(String(fm.next_review), vault.today) : 0;
  const prereqs = Array.isArray(fm.prereqs) ? fm.prereqs.map(String) : [];
  const unproven = prereqs.filter((p) => !proven(vault.byId.get(p)));
  const isNew = fm.status === 'new';
  return {
    gap, due, overdue, prereqs, unproven,
    neverTested: !isNew && fm.status != null && fm.last_tested == null,
    frontier: isNew && unproven.length === 0,
    blocked: isNew && unproven.length > 0,
    since: Array.isArray(fm.sessions) && fm.sessions.length ? String(fm.sessions[0]) : fm.last_studied != null ? String(fm.last_studied) : null,
  };
}

function queue(vault) {
  const states = vault.nodes.map((n) => ({ node: n, s: nodeState(n, vault) }));
  const due = states.filter((x) => x.s.due).sort((a, b) =>
    (b.s.gap - a.s.gap) || (b.s.overdue - a.s.overdue) || ((b.node.fm.hint_count || 0) - (a.node.fm.hint_count || 0)));
  const frontier = states.filter((x) => x.s.frontier);
  const minutes = vault.config.schedule.minutes_per_session;
  const newCount = frontier.length > 0 ? 1 : 0;
  const reviews = Math.min(due.length, Math.max(0, Math.floor((minutes - 15 * newCount) / 10)));
  return {
    today: vault.today,
    budget: { minutes, reviews, new: newCount },
    due: due.map(({ node, s }) => ({
      id: node.id, title: node.title, path: node.rel, status: node.fm.status, confidence: node.fm.confidence ?? null,
      last_result: node.fm.last_result ?? null, next_review: String(node.fm.next_review), overdue_days: s.overdue,
      hint_count: node.fm.hint_count || 0, gap: s.gap,
    })),
    never_tested: states.filter((x) => x.s.neverTested).map(({ node, s }) => ({ id: node.id, title: node.title, path: node.rel, status: node.fm.status, since: s.since })),
    frontier: frontier.map(({ node, s }) => ({ id: node.id, title: node.title, path: node.rel, prereqs: s.prereqs })),
    blocked: states.filter((x) => x.s.blocked).map(({ node, s }) => ({
      id: node.id, title: node.title, path: node.rel,
      needs: s.unproven.map((p) => ({ id: p, status: vault.byId.get(p) ? vault.byId.get(p).fm.status : 'missing' })),
    })),
  };
}

// ---------- rendering ----------
const header = (vault) => `<!-- GENERATED by .lstack/lstack.mjs build on ${vault.today}. Do not hand-edit. -->`;
const link = (n) => `[${n.title}](${n.rel})`;
const dash = '–';

function treeRows(nodes, prefix, out) {
  nodes.forEach((n, i) => {
    const last = i === nodes.length - 1;
    out.push({ node: n, label: n.depth === 0 ? `**${link(n)}**` : `${prefix}${last ? '└' : '├'} ${link(n)}` });
    treeRows(n.children, n.depth === 0 ? '' : `${prefix}${last ? '  ' : '│ '}`, out);
  });
  return out;
}

function renderIndex(vault) {
  const q = queue(vault);
  const count = (s) => vault.nodes.filter((n) => n.fm.status === s).length;
  const rows = treeRows(vault.tree, '', []).map(({ node: n, label }) => {
    const s = nodeState(n, vault);
    const conf = n.fm.confidence == null ? dash : `${n.fm.confidence}${s.gap ? ' ⚠' : ''}`;
    const last = n.fm.last_result == null ? dash : `${n.fm.last_result}${n.fm.last_tested ? ` (${n.fm.last_tested})` : ''}`;
    return `| ${label} | ${n.fm.kind || dash} | ${n.fm.status || dash} | ${conf} | ${last} | ${n.fm.next_review ?? dash} | ${n.fm.hint_count || 0} |`;
  });
  return [
    header(vault),
    `# ${vault.config.title} — index`,
    `Built ${vault.today} · ${vault.nodes.length} nodes · new ${count('new')} · learning ${count('learning')} · reviewing ${count('reviewing')} · mastered ${count('mastered')} · due today ${q.due.length}`,
    '',
    '| Node | Kind | Status | Conf | Last result | Next review | Hints |',
    '|---|---|---|---|---|---|---|',
    ...rows,
    '',
  ].join('\n');
}

function renderGraph(vault) {
  const mid = (id) => id.replace(/[^A-Za-z0-9_]/g, '_');
  const lines = ['flowchart LR',
    '  classDef new fill:#e6e6e6,stroke:#888,color:#222',
    '  classDef learning fill:#fff1a8,stroke:#b59b00,color:#222',
    '  classDef reviewing fill:#cfe2ff,stroke:#3b6fd6,color:#222',
    '  classDef mastered fill:#c8f0c8,stroke:#2e8b2e,color:#222'];
  const decl = (n, indent) => {
    lines.push(`${indent}${mid(n.id)}["${n.title.replace(/"/g, "'")}"]:::${n.fm.status || 'new'}`);
    n.children.forEach((c) => decl(c, indent));
  };
  for (const top of vault.tree) {
    lines.push(`  subgraph sg_${mid(top.id)}["${top.title.replace(/"/g, "'")}"]`);
    decl(top, '    ');
    lines.push('  end');
  }
  for (const n of vault.nodes) for (const p of (Array.isArray(n.fm.prereqs) ? n.fm.prereqs : [])) if (vault.byId.has(String(p))) lines.push(`  ${mid(String(p))} --> ${mid(n.id)}`);
  return [header(vault), `# ${vault.config.title} — prerequisite graph`, '', '```mermaid', ...lines, '```', ''].join('\n');
}

function entries(vault, sectionName) {
  const out = [];
  for (const n of vault.nodes) {
    const sec = n.sections.get(sectionName);
    if (!sec) continue;
    for (const l of sec.lines) { const m = l.match(/^-\s+(.*\S)\s*$/); if (m) out.push({ node: n, text: m[1] }); }
  }
  return out;
}

function renderGlossary(vault) {
  const terms = entries(vault, 'terms').map(({ node, text }) => {
    const [term, ...rest] = text.split('::');
    return { node, term: term.trim(), def: rest.join('::').trim() };
  }).sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }));
  return [header(vault), `# ${vault.config.title} — glossary`, '', ...terms.map((t) => `- **${t.term}** :: ${t.def} — ${link(t.node)}`), ''].join('\n');
}

function renderGrouped(vault, sectionName, titleWord) {
  const lines = [header(vault), `# ${vault.config.title} — ${titleWord}`, ''];
  for (const n of vault.nodes) {
    const items = entries({ nodes: [n] }, sectionName);
    if (!items.length) continue;
    lines.push(`## ${link(n)}`, ...items.map((i) => `- ${i.text}`), '');
  }
  return lines.join('\n');
}

function renderToday(vault) {
  const q = queue(vault);
  const dueLine = (d, i) => {
    const parts = [d.overdue_days > 0 ? `overdue ${d.overdue_days}d` : 'due today'];
    if (d.gap) parts.push(`⚠ conf ${d.confidence} vs last ${d.last_result}`);
    else { if (d.confidence != null) parts.push(`conf ${d.confidence}`); if (d.last_result != null) parts.push(`last ${d.last_result}`); }
    if (d.hint_count > 0) parts.push(`hints ${d.hint_count}`);
    parts.push(`[open](${d.path})`);
    return `${i + 1}. **${d.title}** — ${parts.join(' · ')}`;
  };
  const none = ['- none'];
  return [
    header(vault),
    `# Today — ${vault.today}`,
    `Budget: ${q.budget.minutes} min (from lstack.yaml). Suggested: ${q.budget.reviews} reviews + ${q.budget.new} new (heuristic: about 10 min per review, 15 per new node).`,
    '',
    `## Due (${q.due.length})`, ...(q.due.length ? q.due.map(dueLine) : none), '',
    `## Never tested (${q.never_tested.length})`, ...(q.never_tested.length ? q.never_tested.map((n) => `- [${n.title}](${n.path})${n.since ? ` (${n.status} since ${n.since})` : ''}`) : none), '',
    '## Frontier (next new nodes; all prerequisites are reviewing or better)',
    ...(q.frontier.length ? q.frontier.map((f) => `- [${f.title}](${f.path})${f.prereqs.length ? ` ← ${f.prereqs.join(', ')}` : ''}`) : none), '',
    '## Blocked', ...(q.blocked.length ? q.blocked.map((b) => `- [${b.title}](${b.path}) ← needs ${b.needs.map((x) => `${x.id} (${x.status})`).join(', ')}`) : none), '',
  ].join('\n');
}

const VIEWS = {
  'index.md': renderIndex,
  'graph.md': renderGraph,
  'glossary.md': renderGlossary,
  'analogies.md': (v) => renderGrouped(v, 'analogies', 'analogies'),
  'heuristics.md': (v) => renderGrouped(v, 'heuristics', 'heuristics'),
  'today.md': renderToday,
};

// ---------- lint ----------
function findCycle(vault) {
  const state = new Map();
  const stack = [];
  const visit = (id) => {
    if (state.get(id) === 2) return null;
    if (state.get(id) === 1) return [...stack.slice(stack.indexOf(id)), id];
    const n = vault.byId.get(id);
    if (!n) return null;
    state.set(id, 1); stack.push(id);
    for (const p of (Array.isArray(n.fm.prereqs) ? n.fm.prereqs : [])) { const c = visit(String(p)); if (c) return c; }
    stack.pop(); state.set(id, 2);
    return null;
  };
  for (const n of vault.nodes) { const c = visit(n.id); if (c) return c; }
  return null;
}

function listFiles(dir, prefix = '') {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(path.join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`]);
}

function semverLess(a, b) {
  const pa = String(a).split('.').map(Number); const pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i += 1) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) < (pb[i] || 0); }
  return false;
}

const kbPath = (n) => `kb/${n.rel}`;
const LINT_RULES = [
  { level: 'ERROR', check: (v) => v.nodes.filter((n) => !n.hasFrontmatter).map((n) => [kbPath(n), 'missing frontmatter']) },
  { level: 'ERROR', check: (v) => {
    const seen = new Map();
    return v.nodes.flatMap((n) => { const first = seen.get(n.id); seen.set(n.id, n); return first ? [[kbPath(n), `duplicate id "${n.id}" (also ${kbPath(first)})`]] : []; });
  } },
  { level: 'ERROR', check: (v) => v.nodes.flatMap((n) => (Array.isArray(n.fm.prereqs) ? n.fm.prereqs : []).filter((p) => !v.byId.has(String(p))).map((p) => [kbPath(n), `prereq "${p}" is not a node id`])) },
  { level: 'ERROR', check: (v) => v.nodes.filter((n) => n.hasFrontmatter && n.id !== n.file).map((n) => [kbPath(n), `id "${n.id}" does not match filename "${n.file}"`]) },
  { level: 'ERROR', check: (v) => v.folderErrors.map((f) => [f, `folder has no sibling ${path.basename(f)}.md`]) },
  { level: 'ERROR', check: (v) => { const c = findCycle(v); return c ? [[kbPath(v.byId.get(c[0])), `prereq cycle ${c.join(' -> ')}`]] : []; } },
  { level: 'WARN', check: (v) => v.nodes.filter((n) => n.fm.status && n.fm.status !== 'new').flatMap((n) => {
    const summary = n.sections.get('summary');
    const out = [];
    if (!summary || !summary.lines.some((l) => l.trim())) out.push([kbPath(n), 'no ## Summary']);
    if (n.cards.length === 0) out.push([kbPath(n), 'no cards']);
    return out;
  }) },
  { level: 'WARN', check: (v) => v.nodes.map((n) => [n, nodeState(n, v)]).filter(([, s]) => s.overdue > 0).map(([n, s]) => [kbPath(n), `next_review ${n.fm.next_review} is ${s.overdue} day${s.overdue === 1 ? '' : 's'} overdue`]) },
  { level: 'WARN', check: (v) => v.nodes.filter((n) => nodeState(n, v).gap).map((n) => [kbPath(n), `calibration gap: confidence ${n.fm.confidence} but last result ${n.fm.last_result}`]) },
  { level: 'WARN', check: (v) => {
    const cited = v.nodes.flatMap((n) => (Array.isArray(n.fm.sources) ? n.fm.sources : [])).map((s) => String(s).toLowerCase());
    return listFiles(path.join(v.root, 'sources')).filter((f) => !f.startsWith('.') && !cited.some((c) => c.includes(path.basename(f).toLowerCase()))).map((f) => [`sources/${f}`, 'cited by no node']);
  } },
  { level: 'WARN', check: (v) => {
    const citedBy = new Set(v.nodes.flatMap((n) => (Array.isArray(n.fm.prereqs) ? n.fm.prereqs : []).map(String)));
    return v.nodes.filter((n) => n.depth > 0 && n.children.length === 0 && !citedBy.has(n.id) && !(Array.isArray(n.fm.prereqs) && n.fm.prereqs.length)).map((n) => [kbPath(n), 'orphan: no prereq edges in or out and no children']);
  } },
  { level: 'WARN', check: (v) => v.nodes.flatMap((n) => n.badCards.map((c) => [kbPath(n), `card line matches none of the four forms: ${c.slice(0, 60)}`])) },
  { level: 'WARN', check: (v) => {
    const file = path.join(v.root, '.lstack', 'VERSION');
    if (!fs.existsSync(file)) return [['.lstack/VERSION', 'missing']];
    const installed = fs.readFileSync(file, 'utf8').trim();
    return v.config.lstack && semverLess(installed, v.config.lstack) ? [['.lstack/VERSION', `${installed} is older than lstack.yaml ${v.config.lstack}; rerun /setup-vault to refresh .lstack/`]] : [];
  } },
  { level: 'INFO', check: (v) => v.nodes.filter((n) => Array.isArray(n.fm.sources) && n.fm.sources.some((s) => String(s) === 'agent-proposed')).map((n) => [kbPath(n), 'sources include agent-proposed (unverified)']) },
];

function lint(vault) {
  return LINT_RULES.flatMap((r) => r.check(vault).map(([p, message]) => ({ level: r.level, path: p, message })));
}

// ---------- serve ----------
function page(title, markdown) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{max-width:60rem;margin:2rem auto;padding:0 1rem;font:16px/1.5 system-ui,sans-serif;color:#222}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:.25rem .6rem}nav a{margin-right:1rem}pre{background:#f6f6f6;padding:.5rem;overflow:auto}</style>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script type="module">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
const src=JSON.parse(document.getElementById('md').textContent);document.getElementById('out').innerHTML=marked.parse(src);
for(const c of document.querySelectorAll('code.language-mermaid')){const d=document.createElement('div');d.className='mermaid';d.textContent=c.textContent;c.parentElement.replaceWith(d);}
mermaid.initialize({startOnLoad:false});await mermaid.run();</script></head>
<body><nav><a href="/">index</a><a href="/graph">graph</a><a href="/today">today</a><a href="/glossary">glossary</a></nav>
<script id="md" type="application/json">${JSON.stringify(markdown).replace(/</g, '\\u003c')}</script><div id="out"></div></body></html>`;
}

function serve(vault, port) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = null;
    if (url === '/') file = 'index.md';
    else if (/^\/(graph|today|glossary|analogies|heuristics|index)$/.test(url)) file = `${url.slice(1)}.md`;
    else if (url.startsWith('/node/')) { const n = vault.byId.get(url.slice(6)); file = n ? n.rel : null; }
    else if (url.endsWith('.md')) file = url.slice(1);
    const abs = file ? path.join(vault.root, 'kb', file) : null;
    if (!abs || !abs.startsWith(path.join(vault.root, 'kb')) || !fs.existsSync(abs)) { res.writeHead(404); res.end('not found'); return; }
    const text = fs.readFileSync(abs, 'utf8');
    const { fm, body } = splitFrontmatter(text);
    const shown = fm ? `${body}\n\n## Frontmatter\n\n\`\`\`yaml\n${text.split(/\r?\n/).slice(1, text.split(/\r?\n/).indexOf('---', 1)).join('\n')}\n\`\`\`\n` : text;
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(page(file, shown));
  });
  server.on('error', (e) => { process.stderr.write(`serve: ${e.code === 'EADDRINUSE' ? `port ${port} is in use; try --port ${port + 1}` : e.message}\n`); process.exit(2); });
  server.listen(port, () => process.stdout.write(`lstack serve: http://localhost:${port}/  (Ctrl-C to stop)\n`));
  return server;
}

// ---------- commands ----------
const HELP = `lstack.mjs <command> [--today YYYY-MM-DD]

  build              rebuild kb/index.md graph.md glossary.md analogies.md heuristics.md today.md
  lint               report findings as "LEVEL path: message"; exit 1 if any ERROR
  due [--json]       print the Due, Never tested, Frontier, Blocked lists
  serve [--port N]   read-only local server for index, graph, and node pages (default port 4173)
  version            print .lstack/VERSION

Run from inside a vault (a folder containing lstack.yaml) or any subfolder of one.`;

const COMMANDS = {
  build(vault) {
    for (const [name, render] of Object.entries(VIEWS)) {
      fs.writeFileSync(path.join(vault.root, 'kb', name), render(vault));
      process.stdout.write(`wrote kb/${name}\n`);
    }
    return 0;
  },
  lint(vault) {
    const findings = lint(vault);
    for (const f of findings) process.stdout.write(`${f.level} ${f.path}: ${f.message}\n`);
    process.stdout.write(`${findings.length} finding${findings.length === 1 ? '' : 's'}\n`);
    return findings.some((f) => f.level === 'ERROR') ? 1 : 0;
  },
  due(vault, flags) {
    if (flags.json) process.stdout.write(`${JSON.stringify(queue(vault), null, 2)}\n`);
    else process.stdout.write(renderToday(vault).split('\n').slice(1).join('\n'));
    return 0;
  },
  serve(vault, flags) { serve(vault, Number(flags.port || 4173)); return null; },
  version(vault) {
    const file = path.join(vault.root, '.lstack', 'VERSION');
    process.stdout.write(`${fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim() : 'unknown'}\n`);
    return 0;
  },
};

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      if (key === 'json' || key === 'help') flags[key] = true;
      else { flags[key] = argv[i + 1]; i += 1; }
    } else positional.push(a);
  }
  return { command: positional[0], flags };
}

function main(argv) {
  const { command, flags } = parseArgs(argv);
  if (!command || flags.help || command === '--help') { process.stdout.write(`${HELP}\n`); return command ? 0 : 2; }
  if (!COMMANDS[command]) { process.stderr.write(`unknown command "${command}"\n\n${HELP}\n`); return 2; }
  if (flags.today && !/^\d{4}-\d{2}-\d{2}$/.test(flags.today)) { process.stderr.write('--today must be YYYY-MM-DD\n'); return 2; }
  const root = findVaultRoot(flags.vault || process.cwd());
  if (!root) { process.stderr.write('not inside an lstack vault (no lstack.yaml found here or in any parent)\n'); return 2; }
  let vault;
  try { vault = loadVault(root, flags.today || isoToday()); } catch (e) { process.stderr.write(`parse error: ${e.message}\n`); return 2; }
  return COMMANDS[command](vault, flags);
}

export { parseYaml, splitFrontmatter, parseCards, parseNode, loadVault, queue, lint, VIEWS, resultRatio, daysBetween };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const code = main(process.argv.slice(2));
  if (code !== null) process.exit(code);
}
