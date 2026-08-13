import type { ReactNode } from "react";
import { SiteNav } from "@/components/SiteNav";
import { LightSiteFooter } from "@/components/light/LightSite";

/**
 * Production shell for authenticated pages in the paper edition.
 */
export function MemberPortalShell({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <div className="theme-light">
      <div className={`${className} light-member-portal`.trim()}>
        <SiteNav tone="light" space="member" />
        {children}
        <LightSiteFooter />
      </div>
    </div>
  );
}
