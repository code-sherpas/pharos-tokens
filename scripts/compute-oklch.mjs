#!/usr/bin/env node
/**
 * One-shot helper for Fase 1A: converts Alexandria's observed hex colors
 * into OKLCH and prints DTCG-friendly values. Outputs are copy-pasted into
 * src/color.tokens.json once verified.
 *
 * Usage: node scripts/compute-oklch.mjs
 */
import { converter, parse } from 'culori';

const toOklch = converter('oklch');

function oklchString(hex) {
  const parsed = parse(hex);
  if (!parsed) throw new Error(`Unparseable: ${hex}`);
  const { l, c, h, alpha } = toOklch(parsed);
  const L = (l * 100).toFixed(2);
  const C = c.toFixed(4);
  const H = (h ?? 0).toFixed(2);
  const A = alpha !== undefined && alpha < 1 ? ` / ${alpha.toFixed(3)}` : '';
  return `oklch(${L}% ${C} ${H}${A})`;
}

function table(rows) {
  const max = Math.max(...rows.map((r) => r[0].length));
  for (const [label, hex] of rows) {
    console.log(`${label.padEnd(max)}  ${hex.padEnd(10)}  ${oklchString(hex)}`);
  }
}

console.log('\n=== Neutrals (navy-tinted, derived from Alexandria) ===');
table([
  ['neutral.50', '#f8f8f8'],
  ['neutral.100', '#f5f5f5'],
  ['neutral.200', '#efefef'],
  ['neutral.300', '#d9dadc'],
  ['neutral.400', '#c1c1c1'],
  ['neutral.500', '#6b6b6b'],
  ['neutral.600', '#3c3c3c'],
  ['neutral.700', '#292d32'],
  ['neutral.800', '#2d4256'],
  ['neutral.900', '#101820'],
  ['neutral.950', '#070a14'],
]);

console.log('\n=== Primary (derived from sea-blue #2a48e9) ===');
table([
  ['primary.50', '#eef1fd'],
  ['primary.100', '#dbe1fc'],
  ['primary.200', '#b7c3fa'],
  ['primary.300', '#93a5f7'],
  ['primary.400', '#6f87f0'],
  ['primary.500', '#4c69ec'],
  ['primary.600', '#2a48e9'],
  ['primary.700', '#1e36be'],
  ['primary.800', '#152690'],
  ['primary.900', '#0c1662'],
]);

console.log('\n=== Semantic singles ===');
table([
  ['success.fg', '#05b661'],
  ['success.bg', '#05b66110'],
  ['error.fg', '#ef2828'],
  ['error.bg', '#ef282810'],
  ['warning.fg', '#ddb101'],
  ['warning.bg', '#ddb10110'],
  ['info.fg', '#009bf9'],
  ['info.bg', '#009bf910'],
]);

console.log('\n=== Base ===');
table([
  ['base.white', '#ffffff'],
  ['base.black', '#000000'],
]);

console.log('\nDone. Copy the OKLCH column into src/color.tokens.json ($value fields).\n');
