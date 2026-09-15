#!/usr/bin/env node
// Repo lint for the skill pack. Encodes the conventions from docs/LSTACK-SPEC.md sections 2.2, 10, and 11.0.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYaml, splitFrontmatter } from '../skills/setup-vault/scripts/lstack.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED_SKILLS = 23;
const PREFIX = 'In an lstack learning vault (a folder containing lstack.yaml), ';
const ALLOWED_KEYS = new Set(['name', 'description', 'disable-model-invocation']);
const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);

const skillsDir = path.join(root, 'skills');
const folders = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
if (folders.length !== EXPECTED_SKILLS) fail('skills/', `expected ${EXPECTED_SKILLS} skill folders, found ${folders.length}`);

for (const name of folders) {
  const dir = path.join(skillsDir, name);
  const skillFile = path.join(dir, 'SKILL.md');
  const where = `skills/${name}`;
  if (!fs.existsSync(skillFile)) { fail(where, 'missing SKILL.md'); continue; }
  const text = fs.readFileSync(skillFile, 'utf8');
  const lines = text.split('\n').length;
  if (lines >= 200) fail(where, `SKILL.md is ${lines} lines; must be under 200`);
  const { fm, body } = splitFrontmatter(text);
  if (!fm) { fail(where, 'SKILL.md has no frontmatter'); continue; }
  for (const k of Object.keys(fm)) if (!ALLOWED_KEYS.has(k)) fail(where, `frontmatter key "${k}" is not allowed`);
  if (fm.name !== name) fail(where, `frontmatter name "${fm.name}" does not match folder`);
  if (typeof fm.name !== 'string' || fm.name.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.name)) {
    fail(where, `frontmatter name "${fm.name}" fails the agentskills.io name rules`);
  }
  const desc = String(fm.description || '');
  if (desc.length < 1 || desc.length > 1024) fail(where, `description is ${desc.length} chars; must be 1-1024`);
  if (!desc.startsWith(PREFIX)) fail(where, 'description must start with the vault prefix');
  if (!desc.includes('Use for')) fail(where, 'description lacks "Use for" trigger phrases');
  if (!desc.includes('Skip when')) fail(where, 'description lacks "Skip when" exclusions');
  if (text.includes('$ARGUMENTS')) fail(where, 'uses $ARGUMENTS');
  if (/sub-?agent|subagent/i.test(body) && !/no sub-agents/i.test(body)) fail(where, 'mentions sub-agents');
  if (name !== 'bro' && !body.includes('lstack.yaml')) fail(where, 'body lacks the lstack.yaml precondition');
  if (name !== 'bro' && name !== 'setup-vault' && !(body.includes('MISSION.md') && body.includes('kb/today.md') && body.includes('log/'))) fail(where, 'body lacks the MISSION.md, kb/today.md, newest log read (spec 11.0 rule 4)');
  if (!/node \.lstack\/lstack\.mjs|No writes|no writes|No build needed/.test(body)) fail(where, 'body neither runs .lstack/lstack.mjs nor declares no writes or no build');
  if (/skills\/[a-z-]+\/scripts\/lstack\.mjs/.test(body)) fail(where, 'references the script by skill path instead of .lstack/lstack.mjs');
  const userOnly = fm['disable-model-invocation'] === true;
  const yamlFile = path.join(dir, 'agents', 'openai.yaml');
  if (!fs.existsSync(yamlFile)) { fail(where, 'missing agents/openai.yaml'); continue; }
  const y = fs.readFileSync(yamlFile, 'utf8');
  if (!/display_name:/.test(y) || !/short_description:/.test(y)) fail(where, 'openai.yaml lacks display_name or short_description');
  const implicitOff = /allow_implicit_invocation:\s*false/.test(y);
  if (userOnly && !implicitOff) fail(where, 'user-only skill must set allow_implicit_invocation: false in openai.yaml');
  if (!userOnly && implicitOff) fail(where, 'openai.yaml disables implicit invocation but SKILL.md is not user-only');
}

const script = path.join(root, 'skills', 'setup-vault', 'scripts', 'lstack.mjs');
const scriptLines = fs.readFileSync(script, 'utf8').split('\n').length;
if (scriptLines > 600) fail('skills/setup-vault/scripts/lstack.mjs', `${scriptLines} lines; must be at most 600`);
if (/^import .* from ['"](?!node:)/m.test(fs.readFileSync(script, 'utf8'))) fail('skills/setup-vault/scripts/lstack.mjs', 'imports a non-node: module');

for (const tree of ['.agents/skills', '.claude/skills']) {
  for (const name of folders) {
    const dest = path.join(root, tree, name);
    const where = `${tree}/${name}`;
    let st;
    try { st = fs.lstatSync(dest); } catch { fail(where, 'missing discovery symlink; run node scripts/link-agent-skills.mjs'); continue; }
    if (!st.isSymbolicLink()) { fail(where, 'exists but is not a symlink'); continue; }
    const resolved = fs.realpathSync(dest);
    if (resolved !== path.join(skillsDir, name)) fail(where, `resolves to ${resolved}, expected skills/${name}`);
    if (!fs.existsSync(path.join(dest, 'SKILL.md'))) fail(where, 'SKILL.md missing through the symlink');
  }
}

const plugin = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
const exampleVersion = fs.readFileSync(path.join(root, 'examples', 'linear-algebra', '.lstack', 'VERSION'), 'utf8').trim();
const exampleYaml = parseYaml(fs.readFileSync(path.join(root, 'examples', 'linear-algebra', 'lstack.yaml'), 'utf8'));
if (plugin.version !== exampleVersion || plugin.version !== String(exampleYaml.lstack)) fail('version', `plugin.json ${plugin.version}, example VERSION ${exampleVersion}, example lstack.yaml ${exampleYaml.lstack} disagree`);

for (const p of problems) process.stdout.write(`${p}\n`);
process.stdout.write(`${folders.length} skills checked, ${problems.length} problem${problems.length === 1 ? '' : 's'}\n`);
process.exit(problems.length ? 1 : 0);
