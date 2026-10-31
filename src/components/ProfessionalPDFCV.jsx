import { useTranslation } from "react-i18next";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { cvMetadata } from "../data";
// Fonts are bundled (Vite emits hashed asset URLs) instead of fetched from
// a CDN at click time.
import robotoRegular from "../assets/fonts/roboto-regular-webfont.ttf";
import robotoBold from "../assets/fonts/roboto-bold-webfont.ttf";
import robotoItalic from "../assets/fonts/roboto-italic-webfont.ttf";

Font.register({
  family: "Roboto",
  fonts: [
    { src: robotoRegular, fontWeight: "normal" },
    { src: robotoBold, fontWeight: "bold" },
    { src: robotoItalic, fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
    fontSize: 10,
    lineHeight: 1.25,
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: "1pt solid #000",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  contactItem: {
    fontSize: 9,
    marginHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
    paddingBottom: 2,
    borderBottom: "0.5pt solid #000",
  },
  section: {
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 4,
    fontSize: 10,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillCategory: {
    width: "33.33%",
    marginBottom: 4,
    paddingRight: 8,
  },
  skillCategoryTitle: {
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 3,
  },
  skillList: {
    paddingLeft: 10,
  },
  skillItem: {
    fontSize: 9,
    marginBottom: 2,
  },
  jobEntry: {
    marginBottom: 6,
  },
  jobTitle: {
    fontWeight: "bold",
    fontSize: 11,
  },
  jobPeriod: {
    fontStyle: "italic",
    fontSize: 9,
    marginBottom: 2,
  },
  jobResponsibilities: {
    paddingLeft: 10,
  },
  jobResponsibility: {
    fontSize: 9,
    marginBottom: 1,
  },
  bulletPoint: {
    width: 10,
  },
  project: {
    marginBottom: 5,
  },
  projectTitle: {
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 1,
  },
  projectDescription: {
    fontSize: 9,
    marginBottom: 1,
  },
  projectTech: {
    fontSize: 8,
    fontStyle: "italic",
  },
  certGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  certItem: {
    width: "33.33%",
    paddingRight: 6,
    marginBottom: 2,
    fontSize: 9,
  },
  certName: {
    fontWeight: "bold",
  },
  certIssuer: {
    fontStyle: "italic",
    fontSize: 8,
  },
});

// Accented spelling to match the site-wide unification; cvMetadata.name
// (src/data.js) still carries the ASCII form used elsewhere.
const CV_NAME = "José Camilo Joga Guerrero";

// The CV prints each role's six strongest lines (the locale files order
// them strongest first), so it stays at two pages; the site shows the
// full record.
const CV_LINES = 6;

// Earned certifications, most recent first: the order of the handbook's
// credentials page. CKA (in progress) prints after them with its target.
const CV_CERTS = [
  "spectro",
  "ckad",
  "kcna",
  "hcta",
  "awsSolutionsArchitect",
  "rhce",
  "rhcsa",
  "dynatrace",
  "partner",
  "gitlabImplementation",
  "gitlabServices",
  "gitlabMigration",
  "gitlabCicd",
];

const ProfessionalPDFCV = () => {
  const { t } = useTranslation();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{CV_NAME}</Text>
          <Text style={styles.title}>
            {t("header.cv-title")}
          </Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactItem}>{cvMetadata.email}</Text>
            <Text style={styles.contactItem}>{cvMetadata.phone}</Text>
            <Text style={styles.contactItem}>{cvMetadata.linkedin}</Text>
            <Text style={styles.contactItem}>{cvMetadata.github}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.summary", "PROFESSIONAL SUMMARY")}
          </Text>
          <Text style={styles.paragraph}>{t("hero.description")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.skills", "TECHNICAL SKILLS")}
          </Text>
          <View style={styles.skillsGrid}>
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>
                {t("cv.cloud-platforms", "Cloud Platforms")}
              </Text>
              <View style={styles.skillList}>
                <Text style={styles.skillItem}>• {t("skills.aws")}</Text>
                <Text style={styles.skillItem}>• {t("skills.azure")}</Text>
                <Text style={styles.skillItem}>• {t("skills.eks")}</Text>
                <Text style={styles.skillItem}>• {t("skills.aks")}</Text>
                <Text style={styles.skillItem}>• {t("skills.nutanix")}</Text>
              </View>
            </View>

            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>
                {t("cv.infrastructure", "Infrastructure")}
              </Text>
              <View style={styles.skillList}>
                <Text style={styles.skillItem}>• {t("skills.terraform")}</Text>
                <Text style={styles.skillItem}>• {t("skills.ansible")}</Text>
                <Text style={styles.skillItem}>• {t("skills.kubernetes")}</Text>
                <Text style={styles.skillItem}>• {t("skills.docker")}</Text>
              </View>
            </View>

            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>
                {t("cv.cicd", "CI/CD & DevOps")}
              </Text>
              <View style={styles.skillList}>
                <Text style={styles.skillItem}>• {t("skills.gitlab")}</Text>
                <Text style={styles.skillItem}>
                  • {t("skills.azureDevops")}
                </Text>
                <Text style={styles.skillItem}>
                  • {t("skills.githubActions")}
                </Text>
                <Text style={styles.skillItem}>• {t("skills.jenkins")}</Text>
                <Text style={styles.skillItem}>• {t("skills.argo")}</Text>
              </View>
            </View>

            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>
                {t("cv.ai", "AI & Agents")}
              </Text>
              <View style={styles.skillList}>
                <Text style={styles.skillItem}>• {t("skills.claudeCode")}</Text>
                <Text style={styles.skillItem}>• {t("skills.mcp")}</Text>
              </View>
            </View>

            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>
                {t("cv.monitoring", "Monitoring & Scripting")}
              </Text>
              <View style={styles.skillList}>
                <Text style={styles.skillItem}>• {t("skills.dynatrace")}</Text>
                <Text style={styles.skillItem}>• {t("skills.powershell")}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.experience", "PROFESSIONAL EXPERIENCE")}
          </Text>

          <View style={styles.jobEntry}>
            <Text style={styles.jobTitle}>
              {t("experience.globant.title")}, {t("experience.globant.company")}
            </Text>
            <Text style={styles.jobPeriod}>
              {t("experience.globant.period")}
            </Text>
            <View style={styles.jobResponsibilities}>
              {t("experience.globant.responsibilities", {
                returnObjects: true,
              }).slice(0, CV_LINES).map((item, index) => (
                <Text key={index} style={styles.jobResponsibility}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.jobEntry}>
            <Text style={styles.jobTitle}>
              {t("experience.kodepull.title")},{" "}
              {t("experience.kodepull.company")}
            </Text>
            <Text style={styles.jobPeriod}>
              {t("experience.kodepull.period")}
            </Text>
            <View style={styles.jobResponsibilities}>
              {t("experience.kodepull.responsibilities", {
                returnObjects: true,
              }).slice(0, CV_LINES).map((item, index) => (
                <Text key={index} style={styles.jobResponsibility}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.jobEntry}>
            <Text style={styles.jobTitle}>
              {t("experience.flBetances.title")},{" "}
              {t("experience.flBetances.company")}
            </Text>
            <Text style={styles.jobPeriod}>
              {t("experience.flBetances.period")}
            </Text>
            <View style={styles.jobResponsibilities}>
              {t("experience.flBetances.responsibilities", {
                returnObjects: true,
              }).slice(0, CV_LINES).map((item, index) => (
                <Text key={index} style={styles.jobResponsibility}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.jobEntry}>
            <Text style={styles.jobTitle}>
              {t("experience.arctiq.title")}, {t("experience.arctiq.company")}
            </Text>
            <Text style={styles.jobPeriod}>
              {t("experience.arctiq.period")}
            </Text>
            <View style={styles.jobResponsibilities}>
              {t("experience.arctiq.responsibilities", {
                returnObjects: true,
              }).slice(0, CV_LINES).map((item, index) => (
                <Text key={index} style={styles.jobResponsibility}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.education", "EDUCATION")}
          </Text>
          {["mbaTech", "pucmm"].map((key) => (
            <View key={key} style={styles.jobEntry}>
              <Text style={styles.jobTitle}>
                {t(`education.${key}.degree`)}, {t(`education.${key}.school`)}
              </Text>
              <Text style={styles.jobPeriod}>{t(`education.${key}.period`)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.projects", "KEY PROJECTS")}
          </Text>

          <View style={styles.project}>
            <Text style={styles.projectTitle}>{t("projects.cicd.title")}</Text>
            <Text style={styles.projectDescription}>
              {t("projects.cicd.description")}
            </Text>
            <Text style={styles.projectTech}>
              {t("projects.cicd.tech", { returnObjects: true }).join(", ")}
            </Text>
          </View>

          <View style={styles.project}>
            <Text style={styles.projectTitle}>{t("projects.iac.title")}</Text>
            <Text style={styles.projectDescription}>
              {t("projects.iac.description")}
            </Text>
            <Text style={styles.projectTech}>
              {t("projects.iac.tech", { returnObjects: true }).join(", ")}
            </Text>
          </View>

          <View style={styles.project}>
            <Text style={styles.projectTitle}>
              {t("projects.monitoring.title")}
            </Text>
            <Text style={styles.projectDescription}>
              {t("projects.monitoring.description")}
            </Text>
            <Text style={styles.projectTech}>
              {t("projects.monitoring.tech", { returnObjects: true }).join(
                ", ",
              )}
            </Text>
          </View>

          <View style={styles.project}>
            <Text style={styles.projectTitle}>
              {t("projects.kubestronautSim.title")}
            </Text>
            <Text style={styles.projectDescription}>
              {t("projects.kubestronautSim.description")}
            </Text>
            <Text style={styles.projectTech}>
              {t("projects.kubestronautSim.tech", { returnObjects: true }).join(
                ", ",
              )}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.certifications", "CERTIFICATIONS")}
          </Text>
          <View style={styles.certGrid}>
            {CV_CERTS.map((key) => (
              <View key={key} style={styles.certItem}>
                <Text style={styles.certName}>
                  {t(`certifications.${key}.name`)}
                </Text>
                <Text style={styles.certIssuer}>
                  {t(`certifications.${key}.issuer`)},{" "}
                  {t(`certifications.${key}.date`)}
                </Text>
              </View>
            ))}
            <View style={styles.certItem}>
              <Text style={styles.certName}>
                {t("certifications.cka.name")}
              </Text>
              <Text style={styles.certIssuer}>
                {t("certifications.cka.issuer")} ({t("certifications.inProgress")}) ·{" "}
                {t("certifications.cka.date")}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ProfessionalPDFCV;
