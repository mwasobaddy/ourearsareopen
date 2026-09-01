"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

type Availability = Record<string, string[]>;

export function AvailabilityEditor() {
  const [availability, setAvailability] = useState<Availability>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/availability");
        const data = await res.json();
        if (res.ok) {
          setAvailability(data.availability ?? {});
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggleSlot(day: string, slot: string) {
    setAvailability((prev) => {
      const current = prev[day] ?? [];
      const has = current.includes(slot);
      const next = has
        ? current.filter((s) => s !== slot)
        : [...current, slot].sort();
      return { ...prev, [day]: next };
    });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });
      if (!res.ok) {
        toast.error("Couldn't save availability.");
        return;
      }
      toast.success("Availability saved.");
    } catch {
      toast.error("Couldn't save availability.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your schedule…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center"
              >
                <div className="min-w-[110px]">
                  <Label>{DAY_LABELS[day]}</Label>
                </div>
                <div className="flex flex-wrap gap-3">
                  {SLOTS.map((slot) => {
                    const checked = (availability[day] ?? []).includes(slot);
                    return (
                      <div key={slot} className="flex items-center gap-2">
                        <Checkbox
                          id={`${day}-${slot}`}
                          checked={checked}
                          onCheckedChange={() => toggleSlot(day, slot)}
                        />
                        <Label
                          htmlFor={`${day}-${slot}`}
                          className="cursor-pointer text-sm font-normal"
                        >
                          {slot}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Availability
            </Button>
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
