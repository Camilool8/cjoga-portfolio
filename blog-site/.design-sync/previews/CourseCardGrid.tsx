// Authored preview — the grid of course cards.
import { CourseCard, CourseCardGrid } from "blog-site";

export const Default = () => (
  <CourseCardGrid>
    <CourseCard title="Certified Kubernetes Administrator (CKA)" instructor="Mumshad Mannambeth" platform="KodeKloud" year={2024} hours={20} takeaway="Hands-on labs make the cert stick." link="https://example.com/cka" />
    <CourseCard title="HashiCorp Terraform Associate" instructor="Bryan Krausen" platform="Udemy" year={2026} hours={12} takeaway="Strong state-management deep dive." link="https://example.com/tf" />
    <CourseCard title="AWS Certified Solutions Architect" instructor="Stephane Maarek" platform="Udemy" year={2025} hours={27} takeaway="Broad coverage, great exam prep." link="https://example.com/aws" />
  </CourseCardGrid>
);
