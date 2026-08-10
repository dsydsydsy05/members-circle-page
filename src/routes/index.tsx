import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { HomeHero } from "@/components/home/HomeHero";
import { WhoWeAre } from "@/components/home/WhoWeAre";
import { ImpactSection } from "@/components/home/ImpactSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { EventsSection } from "@/components/home/EventsSection";
import { PeopleSection } from "@/components/home/PeopleSection";
import { ConversationsSection } from "@/components/home/ConversationsSection";
import { WhatsNext } from "@/components/home/WhatsNext";
import { EnterSection } from "@/components/home/EnterSection";
import { useCommunityMembers } from "@/lib/use-community-members";
import { useEvents, useGuests } from "@/lib/use-site-content";
import { projectsFromMembers } from "@/lib/use-projects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Room — A quieter place to build" },
      {
        name: "description",
        content: "A private community for founders, builders and people creating what’s next.",
      },
      { property: "og:title", content: "The Room — A quieter place to build" },
      { property: "og:description", content: "Good people. Real work. What’s next." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theroomcommunity.org/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/" }],
  }),
  component: Home,
});

function Home() {
  const { members } = useCommunityMembers();
  const { data: events = [] } = useEvents();
  const { data: guests = [] } = useGuests();
  const projects = projectsFromMembers(members);

  return (
    <div className="public-page">
      <SiteNav />
      <main>
        <HomeHero />
        <WhoWeAre />
        <ImpactSection
          memberCount={members.length}
          projectCount={projects.length}
          eventCount={events.length}
        />
        <ProjectsSection projects={projects} />
        <EventsSection events={events} />
        <PeopleSection members={members} />
        <ConversationsSection guests={guests} />
        <WhatsNext />
        <EnterSection />
      </main>
      <SiteFooter />
    </div>
  );
}
