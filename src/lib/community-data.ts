/** Public member data normalized from the Supabase `profiles` table. */
export type Member = {
  id: string;
  name: string;
  handle: string;
  role: string;
  city: string;
  bio: string;
  tags: string[];
  website: string;
  linkedinUrl: string;
  contactEmailMask: string;
  initials: string;
  avatarUrl?: string | null;
  memberNo?: number | null;
  featuredOnHome: boolean;
  featuredOrder: number;
};
