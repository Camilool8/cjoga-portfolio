// Shorthand a sheet's commands rely on (CKAD: `k` for kubectl, `$do` for
// --dry-run=client -o yaml). Shared by the sheet, which names it at the top
// of each domain that uses it, and by the copy note (clientModules/
// codeBlocks.js), which says so when a copied command needs it.

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A variable ($do) counts wherever it appears; a word (k) only where it is
// the command: at a line's start or after ; & | ( or $( — never as an
// argument, as in `complete … k`.
export function usesTerm(text, term) {
  if (term.startsWith("$")) {
    return new RegExp(`${escape(term)}(?![\\w])`).test(text);
  }
  return new RegExp(`(?:^|[;&|(]|\\$\\()\\s*${escape(term)}(?=\\s|$)`, "m").test(text);
}

// The line that sets it up: `alias k=…`, `export do=…` or `do=…`.
export function definesTerm(text, term) {
  if (term.startsWith("$")) {
    return new RegExp(`(?:^|[\\s;])(?:export\\s+)?${escape(term.slice(1))}=`, "m").test(text);
  }
  return new RegExp(`\\balias\\s+${escape(term)}=`).test(text);
}
