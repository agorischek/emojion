// A/B benchmark of two builds of the library, interleaved in the same process.
//
//   node bench/ab.mjs <A> <B> [--procs 4] [--rounds 30] [--node <path>]
//                     [--docs large,unicode] [--ops parse,generate] [--json out.json]
//
// A and B are git refs, or `.` for the working tree. Append `@es2022` (or any
// tsc target) to compile that build with a different target. Each build is
// compiled to CommonJS with its own tsconfig, as `npm run build:lib` would.
//
// Why interleave: on this kind of machine, timings for the same code can move
// by 2–3x between runs (core placement, thermals, other load). Running A and
// B in alternating short slices inside one process exposes both to the same
// conditions, so their ratio stays stable even when absolute numbers drift.
// Each build is a separate module instance, so JIT feedback is not shared.
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { corpus } from './corpus.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CACHE = join(ROOT, 'node_modules', '.cache', 'emojion-ab');

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return fallback;
  const [value] = args.splice(i, 2).slice(1);
  return value;
};

// Keep the result of every call alive and flatten it. `+=` builds ropes, and
// V8 defers the cost of flattening one until something reads the string;
// every real consumer (a write, a comparison, JSON.parse) reads it.
let sink = 0;
const consume = (s) => {
  sink = (sink + s.charCodeAt(s.length >> 1)) | 0;
};

const now = () => Number(process.hrtime.bigint());

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

if (args[0] === '--worker') worker(JSON.parse(args[1]));
else await main();

// ---------------------------------------------------------------- worker ---

function worker({ dirs, rounds, docs: only, ops, sliceMs }) {
  const builds = dirs.map((dir) =>
    createRequire(join(dir, 'x.js'))('./lib/index.js')
  );
  const docs = corpus(builds[0].generate).filter(
    (d) => !only || only.includes(d.name)
  );

  // Both builds must agree with each other and with the expected output.
  for (const doc of docs) {
    const emojion = builds[0].generate(doc.json);
    for (const build of builds) {
      if (build.generate(doc.json) !== emojion)
        throw new Error(`generate differs: ${doc.name}`);
      if (build.parse(doc.emojion) !== doc.expected)
        throw new Error(`parse wrong: ${doc.name}`);
    }
  }

  const cases = [];
  for (const doc of docs) {
    for (const op of ops) {
      const input = op === 'parse' ? doc.emojion : doc.json;
      cases.push({
        doc: doc.name,
        op,
        fns: builds.map((b) => {
          const fn = b[op];
          return (n) => {
            for (let i = 0; i < n; i++) consume(fn(input));
          };
        }),
      });
    }
  }

  // Warm up every case on both builds, mixed, then size each slice.
  const deadline = now() + 1.5e9;
  while (now() < deadline)
    for (const c of cases) for (const run of c.fns) run(1);
  for (const c of cases) {
    let n = 1;
    for (;;) {
      const t0 = now();
      c.fns[0](n);
      const dt = now() - t0;
      if (dt > (sliceMs * 1e6) / 4) {
        c.n = Math.max(1, Math.round((n * sliceMs * 1e6) / dt));
        break;
      }
      n *= 2;
    }
    c.times = [[], []];
  }
  globalThis.gc?.();

  for (let round = 0; round < rounds + 3; round++) {
    for (const c of cases) {
      const order = round % 2 ? [1, 0] : [0, 1];
      for (const b of order) {
        const t0 = now();
        c.fns[b](c.n);
        const ns = (now() - t0) / c.n;
        if (round >= 3) c.times[b].push(ns); // the first rounds are more warmup
      }
    }
  }

  const out = cases.map((c) => ({
    doc: c.doc,
    op: c.op,
    a: c.times[0],
    b: c.times[1],
  }));
  process.stdout.write(JSON.stringify({ sink, cases: out }));
}

// ------------------------------------------------------------------ main ---

function build(spec) {
  const [ref, target] = spec.split('@');
  const sha =
    ref === '.'
      ? 'worktree'
      : execFileSync('git', ['rev-parse', '--short', ref], { cwd: ROOT })
          .toString()
          .trim();
  const dir = join(CACHE, `${sha}${target ? '-' + target : ''}`);
  if (ref !== '.' && existsSync(join(dir, 'lib', 'index.js')))
    return { spec, sha, dir };
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  if (ref === '.') {
    cpSync(join(ROOT, 'src'), join(dir, 'src'), { recursive: true });
    cpSync(join(ROOT, 'tsconfig.json'), join(dir, 'tsconfig.json'));
  } else {
    const tar = execFileSync('git', ['archive', ref, 'src', 'tsconfig.json'], {
      cwd: ROOT,
      maxBuffer: 1 << 28,
    });
    execFileSync('tar', ['-x', '-C', dir], { input: tar });
  }
  const tsc = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
  execFileSync(
    process.execPath,
    [
      tsc,
      '-p',
      join(dir, 'tsconfig.json'),
      ...(target ? ['--target', target] : []),
    ],
    {
      cwd: dir,
      stdio: 'inherit',
    }
  );
  return { spec, sha, dir };
}

async function main() {
  const procs = Number(option('procs', 4));
  const rounds = Number(option('rounds', 30));
  const sliceMs = Number(option('slice', 4));
  const node = option('node', process.execPath);
  const docs = option('docs')?.split(',');
  const ops = option('ops', 'generate,parse').split(',');
  const jsonOut = option('json');
  const [specA, specB] = args;
  if (!specA || !specB) {
    console.error(
      'usage: node bench/ab.mjs <A> <B> [--procs N] [--rounds N] [--node path] [--docs a,b] [--ops parse,generate] [--json file]'
    );
    process.exit(2);
  }

  const A = build(specA);
  const B = build(specB);
  if (A.dir === B.dir) {
    // An A/A run: load the same code from two paths so each is its own module.
    const copy = `${A.dir}-copy`;
    rmSync(copy, { recursive: true, force: true });
    cpSync(A.dir, copy, { recursive: true });
    B.dir = copy;
  }
  const version = execFileSync(node, ['--version']).toString().trim();
  console.log(
    `A = ${specA} (${A.sha})  B = ${specB} (${B.sha})  node ${version}`
  );
  console.log(
    `${procs} processes x ${rounds} rounds, ${sliceMs} ms slices; A and B alternate within each process`
  );

  // Alternate which build loads first, in case load order matters.
  const results = [];
  for (let p = 0; p < procs; p++) {
    const swap = p % 2 === 1;
    const dirs = swap ? [B.dir, A.dir] : [A.dir, B.dir];
    const run = spawnSync(
      node,
      [
        '--expose-gc',
        fileURLToPath(import.meta.url),
        '--worker',
        JSON.stringify({ dirs, rounds, docs, ops, sliceMs }),
      ],
      { encoding: 'utf8', maxBuffer: 1 << 28 }
    );
    if (run.status !== 0) {
      console.error(run.stderr);
      process.exit(1);
    }
    const { cases } = JSON.parse(run.stdout);
    for (const c of cases) {
      const [a, b] = swap ? [c.b, c.a] : [c.a, c.b];
      results.push({ proc: p, doc: c.doc, op: c.op, a, b });
    }
    process.stderr.write(`  process ${p + 1}/${procs} done\n`);
  }

  const rows = [];
  const keys = [...new Set(results.map((r) => `${r.op}\t${r.doc}`))];
  for (const key of keys) {
    const [op, doc] = key.split('\t');
    const runs = results.filter((r) => r.op === op && r.doc === doc);
    // Ratio of each adjacent A/B pair, so slow drift cancels out.
    const ratios = runs.flatMap((r) => r.a.map((a, i) => r.b[i] / a));
    const perProc = runs.map((r) => median(r.a.map((a, i) => r.b[i] / a)));
    rows.push({
      op,
      doc,
      a: median(runs.flatMap((r) => r.a)),
      b: median(runs.flatMap((r) => r.b)),
      delta: median(ratios) - 1,
      lo: Math.min(...perProc) - 1,
      hi: Math.max(...perProc) - 1,
    });
  }

  const fmt = (ns) =>
    ns >= 1e6
      ? `${(ns / 1e6).toFixed(2)} ms`
      : ns >= 1e3
        ? `${(ns / 1e3).toFixed(2)} µs`
        : `${ns.toFixed(0)} ns`;
  const pct = (x) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;
  console.log(
    '\nop        doc       A           B           B vs A    per-process range'
  );
  for (const r of rows) {
    console.log(
      `${r.op.padEnd(9)} ${r.doc.padEnd(9)} ${fmt(r.a).padStart(10)}  ${fmt(r.b).padStart(10)}  ${pct(r.delta).padStart(7)}   ${pct(r.lo)} … ${pct(r.hi)}`
    );
  }
  console.log(
    '\nNegative is faster. "per-process range" is the spread of per-process medians.'
  );
  if (jsonOut) {
    writeFileSync(
      resolve(jsonOut),
      JSON.stringify(
        { a: specA, b: specB, node: version, procs, rounds, rows },
        null,
        2
      )
    );
  }
}
