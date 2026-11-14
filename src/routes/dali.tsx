import { createFileRoute } from "@tanstack/react-router";
import { S27ProgramPage } from "@/components/light/S27Programs";

export const Route = createFileRoute("/dali")({
  head: () => ({ meta: [
    { title: "S27 Dali Founder Residency · The Room" },
    { name: "description", content: "14 days in Dali for founders and digital nomads. S27 applications open February 1, 2027." },
    { property: "og:title", content: "S27 Dali Founder Residency · The Room" },
    { property: "og:description", content: "A 14-day Dali residency. Applications open February 1, 2027, at midnight China time." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <S27ProgramPage programKey="dali" />,
});