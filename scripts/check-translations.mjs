#!/usr/bin/env node
// EN/ES translation key-parity check. Exits 1 if either file has keys the
// other lacks. Run via `npm run i18n:check`.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = (lang) =>
  JSON.parse(readFileSync(join(root, "public", "locales", lang, "translation.json"), "utf8"));

const flatten = (obj, prefix = "", out = new Set()) => {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, path, out);
    } else {
      out.add(path);
    }
  }
  return out;
};

const en = flatten(load("en"));
const es = flatten(load("es"));

const enOnly = [...en].filter((k) => !es.has(k));
const esOnly = [...es].filter((k) => !en.has(k));

if (enOnly.length || esOnly.length) {
  if (enOnly.length) console.error(`Missing in ES (${enOnly.length}):\n  ${enOnly.join("\n  ")}`);
  if (esOnly.length) console.error(`Missing in EN (${esOnly.length}):\n  ${esOnly.join("\n  ")}`);
  process.exit(1);
}

console.log(`i18n parity OK — ${en.size} keys in both locales.`);
