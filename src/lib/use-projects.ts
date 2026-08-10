import type { Member } from "@/lib/community-data";

export type CommunityProject = {
  id: string;
  name: string;
  builder: string;
  memberNo: number | null | undefined;
  tags: string[];
  website: string;
  context: string;
};

function hostnameOf(value: string) {
  try {
    const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

/** Projects are derived only from public, onboarded member profiles with a startup field. */
export function projectsFromMembers(members: Member[]): CommunityProject[] {
  return members
    .filter((member) => member.role.includes("·") || (member.website && member.role !== "Member"))
    .map((member) => {
      const [positionOrProject, startup] = member.role.split(" · ");
      const projectName =
        startup || (positionOrProject?.toLowerCase().includes("founder") ? "" : positionOrProject);
      return {
        id: member.id,
        name: projectName || hostnameOf(member.website),
        builder: member.name,
        memberNo: member.memberNo,
        tags: member.tags,
        website: member.website,
        context: member.city,
      };
    })
    .filter((project) => Boolean(project.name));
}
