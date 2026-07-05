# WS-K — Handbook prose remediation (2026-07-04)

Workstream K of the audit remediation wave. Scope: `blog-site/docs/**` prose only.
Source: AUDIT-2026-07-04.md §6 + STYLE.md rubric. Voice preservation over volume.

## Budgets (verify targets)

- `actually` site-wide ≤ 12 (from 33). Untouched files carry 8
  (rhcsa ×2, now ×2, lab/overview ×1, longhorn ×1, arctiq ×1, opinions/index ×1);
  edited files keep 3 that carry real contrast (who-i-am:64, certifications-expire:25,
  keep-it-stupidly-simple:27 bolded question). All others cut.
- `genuinely` site-wide ≤ 4 (from 11). Untouched files carry exactly 4
  (rhcsa ×2, openbao-auto-unseal ×1, longhorn ×1); every occurrence in edited files cut.
- "I want to be honest / honestly" motif ≤ 2 site-wide: keep only
  openbao-over-vault ("Where Vault still wins is at enterprise scale, and I want to
  be honest about that"). Cut/rephrase in terraform-over-bicep, self-hosting-privilege,
  certifications-expire (×2 incl. closer), openbao "weigh it honestly".
- "discipline" closers ≤ 2: keep only terraform-over-bicep. At least 4 of 7 essays
  end on the concrete example: keep-it-stupidly-simple, ai-in-devops-power-user,
  certifications-expire, openbao-over-vault.
- No client names; no on-call clichés; memoir voice only on who-i-am.

## Files to touch

| File | Why |
|---|---|
| `me/opinions/ai-in-devops-power-user.mdx` | Rewrite "The discipline is straightforward" closer to end concrete (the two-hours→twenty-minutes measurement); cut 2× "actually". |
| `me/opinions/certifications-expire.mdx` | Rewrite "So the discipline is simple" closer to end concrete (GitLab badges lapsed, hours to CKAD); thin honesty motif ("worth being honest about", "expire honestly"); cut desc/body "actually" except line 25 (real contrast). |
| `me/opinions/devops-title-2026.mdx` | Fix two cleft inversions ("What grows from here is…", "What is fading is…"); cut 2× "actually" (desc + line 19). Closer already discipline-free — keep its shape. |
| `me/opinions/keep-it-stupidly-simple.mdx` | Re-end on the concrete "still tuning it" story (fold the final abstract moral in before it); keep the bolded "what does the dumb solution actually cost?" (earned contrast); cut 2 other "actually". |
| `me/opinions/openbao-over-vault.mdx` | Rewrite "That's the discipline I try to keep" closer to end on the auto-unseal concrete; cut "genuinely", 3× "actually", "weigh it honestly"; keep the one site-wide "I want to be honest". |
| `me/opinions/self-hosting-privilege.mdx` | Remove "The takeaway is the discipline, not the inventory" scaffold from closer; drop "I want to be honest about the gating cost" framing; soften desc. |
| `me/opinions/terraform-over-bicep.mdx` | Keeps the one allowed "discipline" closer. Cut "I want to be honest about that" (line 22), "genuinely defensible", desc "honest case". |
| `me/reading-and-tools.mdx` | Convert ~13 of 41 em-dashes to periods/commas/colons (prose only — leave structural list separators); cut 4× "actually", 4× "genuinely". |
| `me/who-i-am.mdx` | De-identify line 82 ("global platform with traffic across AME, EMEA, and AP" → drop region enumeration); cut 4× "actually" (keep line 64 contrast), 1× "genuinely". Memoir voice preserved. |
| `me/index.mdx` | "Eleven certifications earned" card description → dateless phrasing; mirror reading-and-tools desc fix. No `last_update` added (card-grid landing has no date frontmatter by design — deviation noted below). |
| `me/credentials.mdx` | "Eleven certifications earned" → "11 certifications earned as of mid-2026". |
| `engineering/work/inspyr-global-solutions.mdx` | Line 39: drop "one of the biggest Azure consumers in the world" superlative AND the Microsoft-preview detail → "very large multi-region Azure platform" framing; replace cryptic "It could not have been any other language." with explicit PowerShell rationale. |
| `engineering/work/kodepull.mdx` | Remove "On this page I'll describe…" throat-clearing (line 26); cut 1× "actually". |

## Frontmatter

Every meaningfully edited doc gets `last_update: {date: "2026-07-04", author: Jose Camilo Joga Guerrero}` —
updated in place where the block exists (credentials, reading-and-tools, kodepull, inspyr),
added where only `date:` exists (who-i-am, all 7 essays). `image:` fields and slugs untouched.
Exception: `me/index.mdx` has no date frontmatter at all (landing page, no dateline eyebrow) — not adding one.

## Not touched (and why)

- `learn/rhcsa.mdx`, `me/now.mdx`, `engineering/lab/*`, `engineering/work/arctiq.mdx`,
  `me/opinions/index.mdx` — their intensifiers either carry contrast or fit inside the
  ≤12/≤4 budgets; editing them would force frontmatter churn for one-word diffs.
- `certifications-expire.mdx` "earned eleven certifications" (lines 19/29) stays: the
  essay is dated and the number is the argument's subject, not a drifting inventory count.

## After edits

`cd blog-site && npm run brand:og` (repo rule; idempotent). Then grep verification:
client names → empty; actually ≤ 12; genuinely ≤ 4; discipline closers ≤ 2.
