import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const dependencies = Object.keys(pkg.dependencies ?? {}).map((name) => name.toLowerCase());
const optionalDependencies = Object.keys(pkg.optionalDependencies ?? {}).map((name) => name.toLowerCase());
const allDependencies = [...dependencies, ...optionalDependencies];

assert.equal(allDependencies.some((name) => name.includes('hermes')), false);
assert.equal(allDependencies.some((name) => name.includes('python')), false);
assert.equal(allDependencies.some((name) => name.includes('nous')), false);

console.log('✓ Hermes Bridge remains optional: no Hermes/Python/Nous runtime dependency added');
