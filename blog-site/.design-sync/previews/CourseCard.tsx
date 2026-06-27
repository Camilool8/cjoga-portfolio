// Authored preview — a single course card (whole card links out when `link` set).
import { CourseCard } from "blog-site";

export const Default = () => (
  <CourseCard
    title="Certified Kubernetes Administrator (CKA) with Practice Tests"
    instructor="Mumshad Mannambeth"
    platform="KodeKloud"
    year={2024}
    hours={20}
    takeaway="The hands-on lab time is what makes the cert stick."
    link="https://example.com/cka"
  />
);
