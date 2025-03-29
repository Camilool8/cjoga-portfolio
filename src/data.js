/**
 * Centralized data file for portfolio website
 * This file contains supplementary data that isn't managed by i18n translations
 */

export const socialLinks = {
  linkedin: "https://www.linkedin.com/in/cjoga",
  github: "https://github.com/",
  email: "josejoga.opx@gmail.com",
};

export const contactInfo = {
  phone: "+1 (809) 881-7982",
};

// Technology icons mapping - icons are imported in components
export const techIcons = {
  aws: "FaAws",
  azure: "FaMicrosoft",
  terraform: "SiTerraform",
  ansible: "SiAnsible",
  kubernetes: "SiKubernetes",
  docker: "FaDocker",
  gitlab: "SiGitlab",
  azureDevops: "FaMicrosoft",
  jenkins: "SiJenkins",
  argo: "SiKubernetes",
  dynatrace: "SiDynatrace",
  powershell: "SiPowershell",
  vue: "FaVuejs",
  node: "FaNodeJs",
  react: "FaReact",
  helm: "SiHelm",
  prometheus: "SiPrometheus",
  grafana: "SiGrafana",
  linux: "FaLinux",
  postgresql: "SiPostgresql",
};

// SEO metadata
export const seoMetadata = {
  title: "Jose Camilo Joga Guerrero | DevOps & Cloud Engineer",
  description:
    "Professional portfolio of Jose Camilo Joga Guerrero, DevOps & Cloud Engineer specializing in automation, CI/CD, Infrastructure as Code, and hybrid cloud environments.",
  keywords:
    "DevOps, Cloud Engineer, AWS, Azure, Kubernetes, CI/CD, Infrastructure as Code, Terraform, Ansible, Docker",
  ogImage: "/images/og-image.webp",
  twitterHandle: "@yourhandle",
};

// Print CV metadata
export const cvMetadata = {
  name: "Jose Camilo Joga Guerrero",
  title: "DevOps & Cloud Engineer",
  email: "josejoga.opx@gmail.com",
  phone: "+1 (809) 881-7982",
  linkedin: "www.linkedin.com/in/cjoga",
  github: "github.com/Camilool8",
};

export default {
  socialLinks,
  contactInfo,
  techIcons,
  seoMetadata,
  cvMetadata,
};
