import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SessionRoom } from "@/components/session/session-room";

export const metadata: Metadata = {
  title: "Live Session | Our Ears Are Open",
  description: "Your live conversation with a listener.",
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ origin?: string }>;
};

export default async function SessionPage({
  params,
  searchParams,
}: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);

  // Determine whether `id` refers to a queue entry or a booking.
  const origin = query.origin === "queue" || query.origin === "booking"
    ? query.origin
    : null;

  if (!origin) {
    redirect(`/session/${encodeURIComponent(id)}?origin=queue`);
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6">
      <SessionRoom origin={origin} refId={id} />
    </section>
  );
}
