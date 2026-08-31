"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CrisisButton } from "@/components/crisis-button";

const DASHBOARD_PREFIXES = ["/team-member", "/workforce", "/admin", "/super-admin", "/listener", "/session"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {!isDashboard && <Navbar />}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      {!isDashboard && <Footer />}
      <CrisisButton />
    </>
  );
}
