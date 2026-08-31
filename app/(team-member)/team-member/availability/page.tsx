import type { Metadata } from "next";
import { Clock, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Availability | Team Member Portal",
  description: "Set your weekly availability for scheduled bookings.",
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Mock - in real app would load from API
const defaultSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

export default function TeamMemberAvailabilityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Set when you&apos;re available for scheduled phone and chat appointments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
          <CardContent>
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Select the days and time slots when you can accept scheduled
                appointments. Limited availability on Sunday. 15 hr/week cap
                applies.
              </p>
            </div>
            <div className="space-y-6">
              {days.map((day) => (
                <div
                  key={day}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center"
                >
                  <div className="min-w-[120px]">
                    <Label>{day}</Label>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {defaultSlots.map((slot) => (
                      <div
                        key={slot}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox id={`${day}-${slot}`} />
                        <Label
                          htmlFor={`${day}-${slot}`}
                          className="cursor-pointer text-sm font-normal"
                        >
                          {slot}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button>Save Availability</Button>
            </div>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
