import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Phone, MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingListenerAssign } from "@/components/admin/booking-listener-assign";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Bookings | Admin",
  description: "Scheduled conversations and their listener assignments.",
};

export const dynamic = "force-dynamic";

const UPCOMING_STATUSES = ["pending", "confirmed"];

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    (profile.role !== "admin" && profile.role !== "super_admin")
  ) {
    redirect("/");
  }

  const { data: listeners } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("role", "listener")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  const listenerOptions = (listeners ?? []).map((l) => ({
    id: l.id,
    full_name: l.full_name,
  }));

  const { data: bookings } = await admin
    .from("bookings")
    .select(
      "id, type, concern, preferences, slot_start, slot_end, payment_option, status, listener_id, created_at, profiles:user_id(full_name, email), bookings_listener_id_fkey(full_name)",
    )
    .order("slot_start", { ascending: false })
    .limit(100);

  const rows = bookings ?? [];

  const upcoming = rows
    .filter(
      (b) =>
        UPCOMING_STATUSES.includes(b.status) &&
        b.slot_start &&
        Date.parse(b.slot_start) > Date.now() - 60 * 60_000,
    )
    .sort((a, b) => (a.slot_start! < b.slot_start! ? -1 : 1));

  const others = rows.filter((b) => !upcoming.includes(b));

  const unassignedUpcoming = upcoming.filter(
    (b) => !b.listener_id && b.status === "confirmed",
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">
          Scheduled conversations, their payment state, and who is covering
          them.
          {unassignedUpcoming > 0 ? (
            <>
              {" "}
              <span className="font-medium text-foreground">
                {unassignedUpcoming} confirmed{" "}
                {unassignedUpcoming === 1 ? "request" : "requests"} still
                waiting for a listener.
              </span>
            </>
          ) : null}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming &amp; recent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[...upcoming, ...others].length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              No bookings yet.
            </p>
          ) : (
            [...upcoming, ...others].map((b) => {
              const customer = Array.isArray(b.profiles)
                ? b.profiles[0]
                : b.profiles;
              const listener = Array.isArray(b.bookings_listener_id_fkey)
                ? b.bookings_listener_id_fkey[0]
                : b.bookings_listener_id_fkey;

              const prefs = (b.preferences ?? {}) as Record<string, string>;
              const prefBits = [
                prefs.gender && prefs.gender !== "no-preference"
                  ? `${prefs.gender} listener`
                  : null,
                prefs.language && prefs.language !== "english"
                  ? prefs.language
                  : null,
                prefs.belief && prefs.belief !== "no-preference"
                  ? prefs.belief
                  : null,
              ].filter(Boolean);

              const assignable =
                (b.status === "confirmed" || b.status === "pending") &&
                (b.slot_start ? Date.parse(b.slot_start) > Date.now() : false);

              return (
                <div
                  key={b.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      {b.type === "phone" ? (
                        <Phone className="h-5 w-5 text-primary" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">
                        {customer?.full_name ?? "Consumer"}
                        {customer?.email ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {customer.email}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {b.slot_start
                          ? new Date(b.slot_start).toLocaleString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "No time set"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {b.type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {b.status}
                        </Badge>
                        <Badge
                          variant={b.payment_option === "free" ? "outline" : "secondary"}
                          className="capitalize"
                        >
                          {b.payment_option}
                        </Badge>
                      </div>
                      {b.concern ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {b.concern}
                        </p>
                      ) : null}
                      {prefBits.length > 0 ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Prefers: {prefBits.join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                    {b.listener_id && listener?.full_name ? (
                      <p className="text-sm">
                        Assigned to{" "}
                        <span className="font-medium">
                          {listener.full_name}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No listener assigned
                      </p>
                    )}
                    <BookingListenerAssign
                      bookingId={b.id}
                      currentListenerId={b.listener_id}
                      currentListenerName={listener?.full_name ?? null}
                      listeners={listenerOptions}
                      disabled={!assignable}
                    />
                    {assignable && b.listener_id ? (
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/session/${b.id}?origin=booking`}>
                          Open room
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
