"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    ageRange: z.string().min(1, "Select your age range"),
    pronouns: z.string(),
    reason: z.string(),
    serviceChat: z.boolean(),
    servicePhone: z.boolean(),
    privacy: z.boolean().refine((v) => v, "You must agree to continue"),
    ageConfirm: z.boolean().refine((v) => v, "You must confirm you are 18+"),
    consent: z.boolean().refine((v) => v, "You must give consent to continue"),
  })
  .refine((v) => v.serviceChat || v.servicePhone, {
    message: "Select at least one conversation type",
    path: ["serviceChat"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      serviceChat: false,
      servicePhone: false,
      privacy: false,
      ageConfirm: false,
      consent: false,
    },
  });

  const serviceChat = watch("serviceChat");
  const servicePhone = watch("servicePhone");

  async function onSubmit(values: RegisterValues) {
    setLoading(true);

    const services = values.serviceChat && values.servicePhone
      ? "both"
      : values.serviceChat
        ? "chat"
        : "phone";

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: `${values.firstName} ${values.lastName}`.trim(),
          age_range: values.ageRange,
          pronouns: values.pronouns,
          reason: values.reason,
          services,
        },
      },
    });

    if (error) {
      toast.error(error.message || "Unable to create account");
      setLoading(false);
      return;
    }

    if (!data.user) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Persist profile info immediately (mirrors auth metadata so the
    // profile setup wizard can prefill it).
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: values.email,
      full_name: `${values.firstName} ${values.lastName}`.trim(),
      age_range: values.ageRange,
      pronouns: values.pronouns,
      reason: values.reason,
      services_consent: values.consent,
    });

    // Fire-and-forget welcome email (no-op until RESEND_API_KEY is set).
    void fetch("/api/email/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: data.user.id }),
    }).catch(() => {});

    // When email confirmation is enabled, no session is created until the
    // user verifies their email (data.session is null / no identities yet).
    const needsEmailConfirmation = !data.session && data.user.identities?.length === 0;

    if (needsEmailConfirmation) {
      setRegisteredEmail(values.email);
      setNeedsVerification(true);
      setLoading(false);
      return;
    }

    toast.success("Account created! Let's finish your profile.");
    router.push(returnUrl ? `/profile/setup?next=${encodeURIComponent(returnUrl)}` : "/profile/setup");
    router.refresh();
  }

  if (needsVerification) {
    return (
      <div className="space-y-4 rounded-lg border border-border bg-muted/40 p-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{registeredEmail}</span>.
          Click the link in the email to verify your account, then you can
          complete your profile and book a conversation.
        </p>
        <Button variant="outline" className="mt-2" asChild>
          <a href="/login">Back to Login</a>
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="First name" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Last name" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          {...register("password")}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters
        </p>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ageRange">Age range (18+ only)</Label>
        <Select onValueChange={(v) => setValue("ageRange", v)}>
          <SelectTrigger id="ageRange">
            <SelectValue placeholder="Select your age range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="18-24">18-24</SelectItem>
            <SelectItem value="25-34">25-34</SelectItem>
            <SelectItem value="35-44">35-44</SelectItem>
            <SelectItem value="45-54">45-54</SelectItem>
            <SelectItem value="55-64">55-64</SelectItem>
            <SelectItem value="65+">65+</SelectItem>
          </SelectContent>
        </Select>
        {errors.ageRange && (
          <p className="text-sm text-destructive">{errors.ageRange.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pronouns">Pronouns (Optional)</Label>
        <Select onValueChange={(v) => setValue("pronouns", v)}>
          <SelectTrigger id="pronouns">
            <SelectValue placeholder="Select your pronouns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="he-him">He/Him</SelectItem>
            <SelectItem value="she-her">She/Her</SelectItem>
            <SelectItem value="they-them">They/Them</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer-not">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">What brings you to Our Ears Are Open?</Label>
        <Select onValueChange={(v) => setValue("reason", v)}>
          <SelectTrigger id="reason">
            <SelectValue placeholder="Select primary reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="anxiety">Anxiety or Stress</SelectItem>
            <SelectItem value="depression">Depression</SelectItem>
            <SelectItem value="relationships">Relationship Issues</SelectItem>
            <SelectItem value="trauma">Trauma or PTSD</SelectItem>
            <SelectItem value="grief">Grief or Loss</SelectItem>
            <SelectItem value="self-improvement">Self Improvement</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Services</Label>
        <p className="text-xs text-muted-foreground">
          We only offer chat conversations, phone conversations, or both.
        </p>
        <div className="grid gap-2 pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="service-chat"
              checked={serviceChat}
              onCheckedChange={(v) => setValue("serviceChat", !!v)}
            />
            <Label htmlFor="service-chat" className="text-sm font-normal">
              Chat conversations
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="service-phone"
              checked={servicePhone}
              onCheckedChange={(v) => setValue("servicePhone", !!v)}
            />
            <Label htmlFor="service-phone" className="text-sm font-normal">
              Phone conversations
            </Label>
          </div>
          {errors.serviceChat && (
            <p className="text-sm text-destructive">{errors.serviceChat.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy"
            checked={watch("privacy")}
            onCheckedChange={(v) => setValue("privacy", !!v)}
          />
          <Label htmlFor="privacy" className="text-sm font-normal leading-relaxed">
            I agree to the{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </Label>
        </div>
        {errors.privacy && (
          <p className="text-sm text-destructive">{errors.privacy.message}</p>
        )}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="ageConfirm"
            checked={watch("ageConfirm")}
            onCheckedChange={(v) => setValue("ageConfirm", !!v)}
          />
          <Label htmlFor="ageConfirm" className="text-sm font-normal leading-relaxed">
            I confirm I am 18 years or older (minimum age to use this platform)
          </Label>
        </div>
        {errors.ageConfirm && (
          <p className="text-sm text-destructive">{errors.ageConfirm.message}</p>
        )}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="consent"
            checked={watch("consent")}
            onCheckedChange={(v) => setValue("consent", !!v)}
          />
          <Label htmlFor="consent" className="text-sm font-normal leading-relaxed">
            I consent to Our Ears Are Open contacting me about services and
            resources
          </Label>
        </div>
        {errors.consent && (
          <p className="text-sm text-destructive">{errors.consent.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Creating account..." : "Create Account & Continue"}
      </Button>
    </form>
  );
}
