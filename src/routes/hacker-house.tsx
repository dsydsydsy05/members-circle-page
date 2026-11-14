import { createFileRoute } from "@tanstack/react-router";
import { S27ProgramPage } from "@/components/light/S27Programs";

export const Route = createFileRoute("/hacker-house")({
  head: () => ({ meta: [
    { title: "S27 Hacker House · The Room" },
    { name: "description", content: "S27 Hacker House applications open December 1, 2026. Follow the countdown with The Room." },
    { property: "og:title", content: "S27 Hacker House · The Room" },
    { property: "og:description", content: "Applications open December 1, 2026, at midnight China time." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <S27ProgramPage programKey="hackerHouse" />,
});