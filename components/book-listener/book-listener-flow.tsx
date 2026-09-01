"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Phone,
  Clock,
  Calendar,
  ArrowRight,
  CheckCircle,
  Loader2,
  UserPlus,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const conversationTypes = [
  {
    id: "phone",
    icon: Phone,
    title: "Phone Conversation",
    description: "One-on-one phone conversation with a trained listener",
    duration: "15 min",
    price: "$10.99",
  },
  {
    id: "chat",
    icon: MessageSquare,
    title: "Chat Conversation",
    description: "Connect with a listener through live text chat",
    duration: "15 min",
    price: "$10.99",
  },
];

const timeSlots = [
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

const genderOptions = [
  { value: "no-preference", label: "No preference" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
];

const beliefOptions = [
  { value: "no-preference", label: "No preference" },
  { value: "religious", label: "Religious" },
  { value: "spiritual", label: "Spiritual" },
  { value: "non-religious", label: "Non-religious" },
];

const languageOptions = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "other", label: "Other" },
];

const orientationPreferenceOptions = [
  { value: "no-preference", label: "No preference" },
  { value: "prefer-similar", label: "Prefer to match with someone similar" },
  { value: "no-match-needed", label: "No specific preference" },
];

export function BookListenerFlow() {
  const supabase = createClient();
  const { isAuthenticated, isLoading, user } = useAuth();

  const [type, setType] = useState<"phone" | "chat">("phone");
  const [paymentOption, setPaymentOption] = useState<"paid" | "free">("paid");
  const [concern, setConcern] = useState("");
  const [gender, setGender] = useState("no-preference");
  const [belief, setBelief] = useState("no-preference");
  const [language, setLanguage] = useState("english");
  const [orientation, setOrientation] = useState("no-preference");
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const wordCount = useMemo(() => {
    const t = concern.trim();
    return t.length === 0 ? 0 : t.split(/\s+/).length;
  }, [concern]);

  async function handleSubmit() {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to book a listener.");
      return;
    }
    if (wordCount < 5) {
      toast.error("Please describe what's on your mind (at least 5 words).");
      return;
    }
    if (!date) {
      toast.error("Please choose a date.");
      return;
    }
    if (!time) {
      toast.error("Please choose a time.");
      return;
    }

    // Combine date (YYYY-MM-DD) + time (e.g. 9:00 AM) into a timestamp.
    const t = time.replace(" ", "");
    const slotStart = new Date(`${date}T${t}:00`);
    const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);

    setSaving(true);
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        type,
        payment_option: paymentOption,
        concern,
        preferences: { gender, belief, language, orientation },
        slot_start: slotStart.toISOString(),
        slot_end: slotEnd.toISOString(),
        status: "pending",
      })
      .select("id")
      .single();

    setSaving(false);
    if (error || !data) {
      toast.error(error?.message || "Couldn't create your booking. Please try again.");
      return;
    }

    toast.success("Booking created!");
    setCreatedBookingId(data.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (createdBookingId) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <CheckCircle className="h-14 w-14 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            You&apos;re all set!
          </h2>
          <p className="max-w-md text-muted-foreground">
            Your {type} conversation is booked. Complete the next step to
            confirm your slot, then a listener will be matched to you.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={`/payment?booking=${createdBookingId}`}>
                Continue to Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/profile">Go to Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Step 1: Conversation Type */}
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            1
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Choose Your Conversation Type
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {conversationTypes.map((t) => (
            <Card
              key={t.id}
              onClick={() => setType(t.id as "phone" | "chat")}
              className={`cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md ${
                type === t.id ? "border-primary shadow-md shadow-primary/10" : "border-border"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <t.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {t.duration}
                      </span>
                      <span className="font-semibold text-primary">{t.price}</span>
                    </div>
                    <div className="mt-4">
                      <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
                        Payment
                      </Label>
                      <RadioGroup
                        className="flex gap-4"
                        value={paymentOption}
                        onValueChange={(v) => setPaymentOption(v as "paid" | "free")}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="paid" id={`${t.id}-paid`} />
                          <Label htmlFor={`${t.id}-paid`} className="cursor-pointer font-normal">
                            Pay {t.price}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="free" id={`${t.id}-free`} />
                          <Label htmlFor={`${t.id}-free`} className="cursor-pointer font-normal">
                            Free option
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Step 2: What's on your mind */}
      <StepHeader number={2} title="What's on your mind?" />
      <Card className="mb-12 border-border">
        <CardContent className="p-6">
          <Label htmlFor="concern" className="text-base">
            What would you like to talk about?{" "}
            <span className="text-crisis text-sm font-normal">(required)</span>
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            In a short paragraph, tell us what you want to talk about so we can
            match you with the right listener. No judgment — just so we can
            better support you.
          </p>
          <Textarea
            id="concern"
            placeholder="Share a little about what's on your mind..."
            rows={4}
            className="mt-4"
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
          />
          <p className="mt-2 text-right text-xs text-muted-foreground">
            {wordCount} {wordCount === 1 ? "word" : "words"}
            {wordCount > 0 && wordCount < 5 && " — at least 5 required"}
          </p>
        </CardContent>
      </Card>

      {/* Step 3: Listener preferences */}
      <StepHeader number={3} title="Listener preferences" />
      <p className="mb-4 text-sm text-muted-foreground">
        Help us match you with the right listener. All preferences are optional.
      </p>
      <Card className="mb-12 border-border">
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gender-pref">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender-pref">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="belief-pref">Religious / spiritual</Label>
              <Select value={belief} onValueChange={setBelief}>
                <SelectTrigger id="belief-pref">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  {beliefOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language-pref">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language-pref">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orientation-pref">Sexual orientation preference</Label>
              <Select value={orientation} onValueChange={setOrientation}>
                <SelectTrigger id="orientation-pref">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  {orientationPreferenceOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Date & Time */}
      <StepHeader number={4} title="Select Date & Time" />
      <Card className="mb-12 border-border">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Label htmlFor="book-date">Preferred Date</Label>
              <Input
                id="book-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Listeners available Monday–Saturday. Limited availability on
                  Sunday.
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <Label>Preferred Time</Label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={time === t ? "default" : "outline"}
                    size="sm"
                    className={time === t ? "" : "bg-transparent hover:bg-primary hover:text-primary-foreground"}
                    onClick={() => setTime(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 5: Sign up / Log in OR Confirm */}
      {isLoading ? null : !isAuthenticated ? (
        <div className="mb-12">
          <StepHeader number={5} title="Sign Up or Log In" />
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center gap-6 p-8 text-center">
              <p className="max-w-lg text-muted-foreground">
                You need to create an account or log in to book a listener. We
                can&apos;t wait to connect you with someone who will truly hear
                you.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/register?returnUrl=/book-listener">
                  <Button size="lg" className="w-full sm:w-auto group">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login?returnUrl=/book-listener">
                  <Button size="lg" variant="outline" className="w-full border-primary/40 sm:w-auto">
                    <LogIn className="mr-2 h-5 w-5" />
                    Log In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl">Ready to Connect?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-muted-foreground">
                  Your slot will be held while you complete the next step. All
                  payments go directly to listeners who are elderly, veterans,
                  single parents, college students, and those who need a second
                  chance. Free options are available.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {paymentOption === "paid" ? (
                    <>
                      Paid conversation:{" "}
                      <span className="font-semibold text-foreground">$10.99</span>
                    </>
                  ) : (
                    <span className="font-semibold text-foreground">
                      Free conversation
                    </span>
                  )}
                </p>
              </div>
              <Button size="lg" onClick={handleSubmit} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Confirm Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function StepHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {number}
      </div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
    </div>
  );
}
