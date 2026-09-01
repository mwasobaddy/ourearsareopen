import type { Metadata } from "next";
import { Info } from "lucide-react";
import { AvailabilityEditor } from "@/components/team-member/availability-editor";

export const metadata: Metadata = {
  title: "Availability | Team Member Portal",
  description: "Set your weekly availability for scheduled bookings.",
};

export default function TeamMemberAvailabilityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Set when you&apos;re available for scheduled phone and chat
          appointments.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          Select the days and time slots when you can accept scheduled
          appointments. A 15 hr/week cap applies.
        </p>
      </div>

      <AvailabilityEditor />
    </div>
  );
}
