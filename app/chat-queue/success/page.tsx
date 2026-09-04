import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QueueStatus } from "@/components/chat-queue/queue-status";
import { getListenersAvailableCount } from "@/lib/session-ops";

export const metadata: Metadata = {
  title: "In the Queue | Our Ears Are Open",
  description: "Your spot in the queue is confirmed.",
};

type Props = {
  searchParams: Promise<{ payment?: string }>;
};

export default async function ChatQueueSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const paymentId = params.payment;

  if (!paymentId) {
    redirect("/chat-queue");
  }

  const listenersAvailable = await getListenersAvailableCount();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6 p-6">
      <QueueStatus paymentId={paymentId} listenersAvailable={listenersAvailable} />
    </div>
  );
}
