import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SupportPanel, type Ticket } from "@/components/admin/support-panel";

export const metadata: Metadata = {
  title: "Support & Refunds | Admin | Our Ears Are Open",
  description: "Initiate refunds and manage support actions.",
};

export default async function AdminSupportPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: tickets } = await admin
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support & Refunds</h1>
        <p className="text-muted-foreground">
          Initiate refunds and add internal notes for support cases.
        </p>
      </div>
      <SupportPanel tickets={(tickets ?? []) as Ticket[]} />
    </div>
  );
}
