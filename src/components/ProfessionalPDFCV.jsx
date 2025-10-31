import React from "react";
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

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontStyle: "italic",
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
    fontSize: 10,
    lineHeight: 1.3,
  },
  header: {
    textAlign: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: "1pt solid #000",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 3,
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
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
    marginBottom: 6,
    paddingBottom: 2,
    borderBottom: "0.5pt solid #000",
  },
  section: {
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 6,
    fontSize: 10,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillCategory: {
    width: "50%",
    marginBottom: 6,
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
    marginBottom: 8,
  },
  jobTitle: {
    fontWeight: "bold",
    fontSize: 11,
  },
  jobPeriod: {
    fontStyle: "italic",
    fontSize: 9,
    marginBottom: 3,
  },
  jobResponsibilities: {
    paddingLeft: 10,
  },
  jobResponsibility: {
    fontSize: 9,
    marginBottom: 2,
  },
  bulletPoint: {
    width: 10,
  },
  project: {
    marginBottom: 6,
  },
  projectTitle: {
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 9,
    marginBottom: 2,
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
    width: "50%",
    marginBottom: 4,
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

// Create Document Component
const ProfessionalPDFCV = () => {
  const { t } = useTranslation();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{cvMetadata.name}</Text>
          <Text style={styles.title}>
            {t("header.cv-title", "DevOps & Cloud Engineer")}
          </Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactItem}>{cvMetadata.email}</Text>
            <Text style={styles.contactItem}>{cvMetadata.phone}</Text>
            <Text style={styles.contactItem}>{cvMetadata.linkedin}</Text>
            <Text style={styles.contactItem}>{cvMetadata.github}</Text>
          </View>
        </View>

        {/* Professional Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.summary", "PROFESSIONAL SUMMARY")}
          </Text>
          <Text style={styles.paragraph}>{t("hero.description")}</Text>
        </View>

        {/* Technical Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.skills", "TECHNICAL SKILLS")}
          </Text>
          <View style={styles.skillsGrid}>
            {/* Cloud Platforms */}
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>
                {t("cv.cloud-platforms", "Cloud Platforms")}
              </Text>
              <View style={styles.skillList}>
                <Text style={styles.skillItem}>• {t("skills.aws")}</Text>
                <Text style={styles.skillItem}>• {t("skills.azure")}</Text>
              </View>
            </View>

            {/* Infrastructure */}
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

            {/* CI/CD & DevOps */}
            <View style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>
                {t("cv.cicd", "CI/CD & DevOps")}
              </Text>
              <View style={styles.skillList}>
                <Text style={styles.skillItem}>• {t("skills.gitlab")}</Text>
                <Text style={styles.skillItem}>
                  • {t("skills.azureDevops")}
                </Text>
                <Text style={styles.skillItem}>• {t("skills.jenkins")}</Text>
                <Text style={styles.skillItem}>• {t("skills.argo")}</Text>
              </View>
            </View>

            {/* Monitoring & Scripting */}
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

        {/* Professional Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.experience", "PROFESSIONAL EXPERIENCE")}
          </Text>

          {/* Arroyo Consulting */}
          <View style={styles.jobEntry}>
            <Text style={styles.jobTitle}>
              {t("experience.arroyo.title")}, {t("experience.arroyo.company")}
            </Text>
            <Text style={styles.jobPeriod}>
              {t("experience.arroyo.period")}
            </Text>
            <View style={styles.jobResponsibilities}>
              {t("experience.arroyo.responsibilities", {
                returnObjects: true,
              }).map((item, index) => (
                <Text key={index} style={styles.jobResponsibility}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>

          {/* FL Betances */}
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
              }).map((item, index) => (
                <Text key={index} style={styles.jobResponsibility}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>

          {/* Shadow-Soft */}
          <View style={styles.jobEntry}>
            <Text style={styles.jobTitle}>
              {t("experience.shadowSoft.title")},{" "}
              {t("experience.shadowSoft.company")}
            </Text>
            <Text style={styles.jobPeriod}>
              {t("experience.shadowSoft.period")}
            </Text>
            <View style={styles.jobResponsibilities}>
              {t("experience.shadowSoft.responsibilities", {
                returnObjects: true,
              }).map((item, index) => (
                <Text key={index} style={styles.jobResponsibility}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Key Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.projects", "KEY PROJECTS")}
          </Text>

          {/* Project 1 */}
          <View style={styles.project}>
            <Text style={styles.projectTitle}>{t("projects.cicd.title")}</Text>
            <Text style={styles.projectDescription}>
              {t("projects.cicd.description")}
            </Text>
            <Text style={styles.projectTech}>
              {t("projects.cicd.tech", { returnObjects: true }).join(", ")}
            </Text>
          </View>

          {/* Project 2 */}
          <View style={styles.project}>
            <Text style={styles.projectTitle}>{t("projects.iac.title")}</Text>
            <Text style={styles.projectDescription}>
              {t("projects.iac.description")}
            </Text>
            <Text style={styles.projectTech}>
              {t("projects.iac.tech", { returnObjects: true }).join(", ")}
            </Text>
          </View>

          {/* Project 3 */}
          <View style={styles.project}>
            <Text style={styles.projectTitle}>
              {t("projects.monitoring.title")}
            </Text>
            <Text style={styles.projectDescription}>
              {t("projects.monitoring.description")}
            </Text>
            <Text style={styles.projectTech}>
              {t("projects.monitoring.tech", { returnObjects: true }).join(
                ", "
              )}
            </Text>
          </View>
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("cv.certifications", "CERTIFICATIONS")}
          </Text>
          <View style={styles.certGrid}>
            <View style={styles.certItem}>
              <Text style={styles.certName}>
                {t("certifications.awsSolutionsArchitect.name")}
              </Text>
              <Text style={styles.certIssuer}>
                {t("certifications.awsSolutionsArchitect.issuer")},{" "}
                {t("certifications.awsSolutionsArchitect.date")}
              </Text>
            </View>
            <View style={styles.certItem}>
              <Text style={styles.certName}>
                {t("certifications.rhcsa.name")}
              </Text>
              <Text style={styles.certIssuer}>
                {t("certifications.rhcsa.issuer")},{" "}
                {t("certifications.rhcsa.date")}
              </Text>
            </View>
            <View style={styles.certItem}>
              <Text style={styles.certName}>
                {t("certifications.rhce.name")}
              </Text>
              <Text style={styles.certIssuer}>
                {t("certifications.rhce.issuer")},{" "}
                {t("certifications.rhce.date")}
              </Text>
            </View>
            <View style={styles.certItem}>
              <Text style={styles.certName}>
                {t("certifications.dynatrace.name")}
              </Text>
              <Text style={styles.certIssuer}>
                {t("certifications.dynatrace.issuer")},{" "}
                {t("certifications.dynatrace.date")}
              </Text>
            </View>
            <View style={styles.certItem}>
              <Text style={styles.certName}>
                {t("certifications.gitlabCicd.name")}
              </Text>
              <Text style={styles.certIssuer}>
                {t("certifications.gitlabCicd.issuer")},{" "}
                {t("certifications.gitlabCicd.date")}
              </Text>
            </View>
            <View style={styles.certItem}>
              <Text style={styles.certName}>
                {t("certifications.gitlabServices.name")}
              </Text>
              <Text style={styles.certIssuer}>
                {t("certifications.gitlabServices.issuer")},{" "}
                {t("certifications.gitlabServices.date")}
              </Text>
            </View>
            <View style={styles.certItem}>
              <Text style={styles.certName}>
                {t("certifications.partner.name")}
              </Text>
              <Text style={styles.certIssuer}>
                {t("certifications.partner.issuer")},{" "}
                {t("certifications.partner.date")}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ProfessionalPDFCV;
