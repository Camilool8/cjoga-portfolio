// The handbook's entry points by reader: shared by the landing page and
// the 404 page, so a lost reader gets the same routes the landing offers.
// Learners come first (the handbook's primary readers); guide order
// follows the sidebar and the Learn menu.
//
// Each label is the title of the page it opens (its H1 and sidebar
// label), so a reader lands where the link said; the one link off the
// handbook, the CV, keeps the label it has everywhere else. Each group's
// one-line intro is drawn from the descriptions of the pages it lists.
const READER_PATHS = [
  {
    id: "studying",
    title: "If you’re studying",
    intro:
      "Exam guides for RHCSA, RHCE and CKAD, and kubestronaut-sim, the open-source exam simulator I built.",
    rows: [
      { to: "/learn/rhcsa", label: "RHCSA (EX200) guide" },
      { to: "/learn/rhce", label: "RHCE (EX294) guide" },
      { to: "/learn/ckad", label: "CKAD guide" },
      { to: "/learn/kubestronaut-sim", label: "kubestronaut-sim" },
    ],
  },
  {
    id: "hiring",
    title: "If you’re hiring",
    intro:
      "Where I’m from and how I work, my engagements by employer, my certifications in the order I earned them, and my CV.",
    rows: [
      { to: "/me/who-i-am", label: "Who I am" },
      { to: "/engineering/work", label: "Work" },
      { to: "/me/credentials", label: "Credentials" },
      // The CV is generated on the portfolio: this lands on the section
      // with its "Download CV" button. Same label as the author sign-off
      // and the footer; same product, so it opens in place, unmarked.
      { to: "https://cjoga.cloud/#contact", label: "CV on cjoga.cloud" },
    ],
  },
  {
    // "Cluster", not "lab": the exam guides above have labs of their own.
    // The id stays "homelab" so existing anchors keep working.
    id: "homelab",
    title: "If you’re curious about the cluster",
    intro:
      "KodePull’s six-node K3s cluster behind cjoga.cloud, the homelab it grew out of, and short posts about what broke and what I’d do differently.",
    rows: [
      { to: "/engineering/lab/overview", label: "Cluster overview" },
      { to: "/engineering/lab/tips-and-gotchas", label: "Tips and gotchas" },
    ],
  },
  {
    id: "opinions",
    // The group holds Now as well as Opinions, so the heading names both.
    title: "If you want my opinions and what I’m up to",
    intro:
      "Takes on the tools and practices I work with, and what I’m working on and learning now.",
    rows: [
      { to: "/me/opinions", label: "Opinions" },
      { to: "/me/now", label: "Now" },
    ],
  },
];

export default READER_PATHS;
