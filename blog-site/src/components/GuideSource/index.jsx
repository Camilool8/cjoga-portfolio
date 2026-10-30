// The source a guide interprets — the lab or simulator repository that
// stays the source of truth. One hairline row under the guide's intro, so
// a reader who came for the runbook finds it without reading for the link.
//
// Usage (registered globally in MDXComponents):
//   <GuideSource
//     repo="Camilool8/RHCSA-LAB"
//     href="https://github.com/Camilool8/RHCSA-LAB"
//     note="Three broken RHEL 9 servers, the full task list and the answers"
//     sheet
//   />
//
// `note` is one line: what the repo holds, which is what the reader needs
// to decide whether to open it. The guide's lede already says what the
// page is.
//
// `sheet` is for a guide with a DomainSheet: a second row in the same
// frame jumps to the sheet's index, the night-before part of the page,
// which otherwise sits several screens down. `true` names it "Key
// commands by domain", the sheet's own heading; a string names it
// otherwise.

import React from "react";
import Link from "@docusaurus/Link";
import { SiGithub } from "react-icons/si";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";
import styles from "./styles.module.css";

// DomainSheet's index label (its INDEX_ID); "All domains" lands there too.
const SHEET_INDEX = "domain-sheet-index";

// As the sheet's own links do: focus follows the view, so the next Tab
// continues from the sheet's index. tabindex is set only now, so the
// browser's fragment focus doesn't cut the smooth scroll short.
function focusTarget(event) {
  const target = document.getElementById(event.currentTarget.hash.slice(1));
  if (!target) return;
  requestAnimationFrame(() => {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

export default function GuideSource({ repo, href, note, sheet }) {
  const [owner, name] = repo.split("/");
  const source = (
    <a
      className={styles.source}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <SiGithub className={styles.mark} aria-hidden="true" />
      <span className={styles.body}>
        {/* A narrow row breaks the name after the owner, not mid-word. */}
        <span className={styles.repo}>
          {owner}/<wbr />
          {name}
        </span>
        {/* A space for text readers (search excerpts); the grid hides it. */}
        {note ? " " : null}
        {note ? <span className={styles.note}>{note}</span> : null}
      </span>
      <FiArrowUpRight className={styles.arrow} aria-hidden="true" />
      <span className={styles.srOnly}> (opens in a new tab) </span>
    </a>
  );
  if (!sheet) {
    return <div className={styles.frame}>{source}</div>;
  }
  return (
    <div className={styles.frame}>
      {source}
      {/* Two links side by side in one frame, never one inside the other. */}
      <Link className={styles.jump} to={`#${SHEET_INDEX}`} onClick={focusTarget}>
        <span className={styles.jumpLabel}>
          {typeof sheet === "string" ? sheet : "Key commands by domain"}
        </span>
        <FiArrowDown className={styles.arrow} aria-hidden="true" />
      </Link>
    </div>
  );
}
