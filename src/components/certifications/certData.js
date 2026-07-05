import { FaRedhat, FaAward, FaAws } from "react-icons/fa";
import {
  SiDynatrace,
  SiGitlab,
  SiTerraform,
  SiKubernetes,
} from "react-icons/si";

// Bento — every tile gets a live animation. All tiles are 2 rows tall.
//   lg (6 cols × 6 rows = 36 cells):
//     [KCNA 3×2 — 2026]      [AWS 3×2 — 2025]
//     [HCTA 2×2] [Dyna 2×2] [Partner 2×2]   ← 2023+
//     [RedHat 2×2 — 2024]     [GitLab 4×2 — 2022]
//
// Taglines and the Kubestronaut progress label are NOT stored here —
// the section component translates them by `groupId`
// (`certifications.groups.<groupId>.tagline` / `.progressLabel`).
export const CERT_GROUPS = [
  {
    groupId: "kubestronaut",
    vendor: "Linux Foundation",
    vendorShort: "CNCF",
    icon: SiKubernetes,
    color: "#326ce5",
    size: "featured",
    liveTile: "kubestronaut",
    progress: { current: 1, inProgress: 1, total: 5 },
    spanClasses: "md:col-span-2 md:row-span-2 lg:col-span-3",
    certs: [
      {
        key: "kcna",
        link: "https://www.credly.com/badges/bc307278-2a6d-4065-a1b5-5b1b7bda61bd",
      },
    ],
    inProgressCerts: [
      {
        key: "ckad",
        link: "https://www.cncf.io/training/certification/ckad/",
      },
    ],
  },
  {
    groupId: "aws",
    vendor: "Amazon Web Services",
    vendorShort: "AWS",
    icon: FaAws,
    color: "#ff9900",
    size: "featured",
    liveTile: "aws",
    spanClasses: "md:col-span-2 md:row-span-2 lg:col-span-3",
    certs: [
      {
        key: "awsSolutionsArchitect",
        link: "https://www.credly.com/badges/4a977479-db27-4850-8962-d038b062a7d2",
      },
    ],
  },
  {
    groupId: "terraform",
    vendor: "HashiCorp",
    vendorShort: "HashiCorp",
    icon: SiTerraform,
    color: "#7f4dff",
    size: "standard",
    liveTile: "terraform",
    spanClasses: "md:col-span-1 md:row-span-2 lg:col-span-2",
    certs: [
      {
        key: "hcta",
        link: "https://www.credly.com/badges/9f285077-46e9-431d-88f3-e4107546d668",
      },
    ],
  },
  {
    groupId: "dynatrace",
    vendor: "Dynatrace",
    vendorShort: "Dynatrace",
    icon: SiDynatrace,
    color: "#73be28",
    size: "standard",
    liveTile: "dynatrace",
    spanClasses: "md:col-span-1 md:row-span-2 lg:col-span-2",
    certs: [
      {
        key: "dynatrace",
        link: "https://www.credly.com/badges/2239d2e7-c0f8-4ee0-8e04-2429d0c774bc",
      },
    ],
  },
  {
    groupId: "partner",
    vendor: "Technology Partners",
    vendorShort: "Partner",
    icon: FaAward,
    color: null,
    size: "standard",
    liveTile: "award",
    spanClasses: "md:col-span-2 md:row-span-2 lg:col-span-2",
    certs: [
      {
        key: "partner",
        link: "https://www.credly.com/badges/209bae19-6dbe-4cc2-8350-28cf4102ec46",
      },
    ],
  },
  {
    groupId: "redhat",
    vendor: "Red Hat",
    vendorShort: "Red Hat",
    icon: FaRedhat,
    color: "#ee0000",
    size: "tall",
    liveTile: "redhat",
    spanClasses: "md:col-span-2 md:row-span-2 lg:col-span-2",
    certs: [
      {
        key: "rhcsa",
        link: "https://www.credly.com/badges/3d2d03bb-5108-41da-81ad-6e47c80e3eed",
      },
      {
        key: "rhce",
        link: "https://www.credly.com/badges/2ba3ac77-f45d-4cfa-a286-7d27d379f429",
      },
    ],
  },
  {
    groupId: "gitlab",
    vendor: "GitLab",
    vendorShort: "GitLab",
    icon: SiGitlab,
    color: "#fc6d26",
    size: "wide",
    liveTile: "gitlab",
    spanClasses: "md:col-span-2 md:row-span-2 lg:col-span-4",
    certs: [
      {
        key: "gitlabMigration",
        link: "https://www.credly.com/badges/5a3d21a3-c24a-496c-88d4-5eac982c9cd3",
      },
      {
        key: "gitlabServices",
        link: "https://www.credly.com/badges/4a4a52c6-56b1-4518-acef-24f772434e5e",
      },
      {
        key: "gitlabCicd",
        link: "https://www.credly.com/badges/518a6de5-bae5-432f-9d90-0800eba2d4b5",
      },
      {
        key: "gitlabImplementation",
        link: "https://www.credly.com/badges/585b9001-7570-4e30-99d5-5f043534cf2a",
      },
    ],
  },
];

// Earned certifications only — inProgressCerts (CKAD) stay excluded.
export const CERT_COUNT = CERT_GROUPS.flatMap((g) => g.certs).length;
