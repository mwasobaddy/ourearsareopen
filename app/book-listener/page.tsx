import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquare,
  Phone,
  ArrowRight,
  AlertTriangle,
  Clock,
  Calendar,
  Headphones,
} from "lucide-react";
import { AnimatedWritingAvatar } from "@/components/animated-writing-avatar";
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
import { BookListenerStep5AndPayment } from "@/components/book-listener/book-listener-step5-and-payment";

export const metadata: Metadata = {
  title: "Book a Listener | Our Ears Are Open",
  description:
    "Take the first step toward peace. Book a 15-minute phone or chat conversation with a caring listener. Free option available.",
};

const conversationTypes = [
  {
    id: "phone",
    icon: Phone,
    title: "Phone Conversation",
    description: "One-on-one phone conversation with a trained listener",
    duration: "15 min",
    price: "$10.99",
    freeOption: true,
  },
  {
    id: "chat",
    icon: MessageSquare,
    title: "Chat Conversation",
    description: "Connect with a listener through live text chat",
    duration: "15 min",
    price: "$10.99",
    freeOption: true,
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

const steps = [
  { number: 1, label: "Conversation Type" },
  { number: 2, label: "What's on your mind" },
  { number: 3, label: "Listener preferences" },
  { number: 4, label: "Date & Time" },
  { number: 5, label: "Sign up / Log in" },
];

export default function BookListenerPage() {
  return (
    <>
      {/* Crisis Warning Banner */}
      <section className="bg-crisis/10 py-3">
        <div className="container mx-auto flex items-center justify-center gap-3 px-4 text-center">
          <AlertTriangle className="h-5 w-5 shrink-0 text-crisis" />
          <span className="text-sm text-foreground">
            If you are in immediate crisis, please{" "}
            <Link href="/crisis" className="font-medium text-crisis underline">
              click here for crisis resources
            </Link>{" "}
            or call 988.
          </span>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-background py-14 md:py-20 lg:py-28">
        {/* Subtle accent */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl pointer-events-none" aria-hidden />
        <div className="container relative mx-auto px-4">
          <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Left — headline & intro */}
            <div className="order-2 lg:order-1 flex flex-col justify-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm ring-1 ring-primary/10">
                <Headphones className="h-9 w-9" />
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[2.75rem]">
                Book a Listener
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground max-w-xl">
                Take the first step toward peace. Choose how you want to connect,
                share a little about what&apos;s on your mind, and pick a time
                that works for you. A caring listener will be there.
              </p>
            </div>

            {/* Right — animated avatar (We Care, Safe Space, Let&apos;s talk) — ~50% page width */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end items-center w-full min-h-[420px] lg:min-h-[520px]">
              <div className="w-full min-w-[320px] max-w-full rounded-3xl ring-2 ring-primary/10 ring-offset-4 ring-offset-background shadow-2xl shadow-primary/10">
                <AnimatedWritingAvatar />
              </div>
            </div>
          </div>

          {/* Step indicator — visually connected below hero content */}
          <div className="mx-auto mt-14 max-w-3xl hidden md:flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {step.number}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="mb-4 h-px w-8 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="bg-brown py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">

            {/* Step 1: Choose Conversation Type */}
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
                {conversationTypes.map((type) => (
                  <Card
                    key={type.id}
                    className="cursor-pointer border-2 border-border transition-all hover:border-primary hover:shadow-md hover:shadow-primary/10"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <type.icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground">
                            {type.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {type.description}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {type.duration}
                            </span>
                            <span className="font-semibold text-primary">
                              {type.price}
                            </span>
                            {type.freeOption && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                Free option available
                              </span>
                            )}
                          </div>
                          <RadioGroup
                            name={`type-${type.id}`}
                            className="mt-4 flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={`${type.id}-paid`}
                                id={`${type.id}-paid`}
                              />
                              <Label
                                htmlFor={`${type.id}-paid`}
                                className="font-normal cursor-pointer"
                              >
                                Pay {type.price}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={`${type.id}-free`}
                                id={`${type.id}-free`}
                              />
                              <Label
                                htmlFor={`${type.id}-free`}
                                className="font-normal cursor-pointer"
                              >
                                Free option
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Step 2: What's on your mind */}
            <div className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  2
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  What&apos;s on your mind?
                </h2>
              </div>
              <Card className="border-border">
                <CardContent className="p-6">
                  <Label htmlFor="concern" className="text-base">
                    What would you like to talk about?{" "}
                    <span className="text-crisis text-sm font-normal">
                      (required)
                    </span>
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    In a short paragraph, tell us what you want to talk about so
                    we can match you with the right listener. No judgment — just
                    so we can better support you.
                  </p>
                  <Textarea
                    id="concern"
                    placeholder="Share a little about what's on your mind..."
                    rows={4}
                    className="mt-4"
                    required
                  />
                </CardContent>
              </Card>
            </div>

            {/* Step 3: Listener preferences */}
            <div className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  3
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Listener preferences
                </h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Help us match you with the right listener. All preferences are
                optional.
              </p>
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="gender-pref">Gender</Label>
                      <Select name="gender-pref">
                        <SelectTrigger id="gender-pref">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="belief-pref">Religious / spiritual</Label>
                      <Select name="belief-pref">
                        <SelectTrigger id="belief-pref">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          {beliefOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language-pref">Language</Label>
                      <Select name="language-pref">
                        <SelectTrigger id="language-pref">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orientation-pref">
                        Sexual orientation preference
                      </Label>
                      <Select name="orientation-pref">
                        <SelectTrigger id="orientation-pref">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          {orientationPreferenceOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 4: Date & Time */}
            <div className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  4
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Select Date & Time
                </h2>
              </div>
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <Label htmlFor="book-date">Preferred Date</Label>
                      <Input id="book-date" type="date" />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Listeners available Monday–Saturday. Limited
                          availability on Sunday.
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label>Preferred Time</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-primary hover:text-primary-foreground"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Label>Conversation format</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We offer phone and chat conversations only — no video or
                      in-person.
                    </p>
                    <RadioGroup
                      defaultValue="phone"
                      className="mt-3 flex flex-wrap gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="format-phone" />
                        <Label
                          htmlFor="format-phone"
                          className="flex cursor-pointer items-center gap-2 font-normal"
                        >
                          <Phone className="h-4 w-4" />
                          Phone
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="chat" id="format-chat" />
                        <Label
                          htmlFor="format-chat"
                          className="flex cursor-pointer items-center gap-2 font-normal"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Chat
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 5: Sign up / Log in (when not logged in) — hidden when logged in */}
            {/* Ready to Connect (updated copy) */}
            <BookListenerStep5AndPayment />
          </div>
        </div>
      </section>
    </>
  );
}
