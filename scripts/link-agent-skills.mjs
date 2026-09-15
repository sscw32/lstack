#!/usr/bin/env node
// Point the agent discovery trees at skills/<name>. Safe to rerun.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

const trees = ['.agents/skills', '.claude/skills'];
for (const tree of trees) {
  const destDir = path.join(root, tree);
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of names) {
    const dest = path.join(destDir, name);
    const rel = path.relative(destDir, path.join(root, 'skills', name));
    try {
      const st = fs.lstatSync(dest);
      if (!st.isSymbolicLink()) throw new Error(`${tree}/${name} exists and is not a symlink`);
      fs.unlinkSync(dest);
    } catch (err) {
      if (err && err.code !== 'ENOENT') throw err;
    }
    fs.symlinkSync(rel, dest);
  }
}

process.stdout.write(`linked ${names.length} skills into ${trees.join(' and ')}\n`);
