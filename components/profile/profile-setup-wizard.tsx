"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  AGE_RANGE_OPTIONS,
  COUNTRY_OPTIONS,
  GENDER_OPTIONS,
  ORIENTATION_OPTIONS,
  PRIOR_THERAPY_OPTIONS,
  RELATIONSHIP_OPTIONS,
  RELIGION_IMPORTANCE_OPTIONS,
  SPIRITUAL_OPTIONS,
} from "@/lib/profile-options";

export type ProfileFormValues = {
  full_name: string | null;
  pronouns: string | null;
  age_range: string | null;
  country: string | null;
  gender_identity: string | null;
  sexual_orientation: string | null;
  relationship_status: string | null;
  religion_importance: string | null;
  spiritual: string | null;
  prior_therapy: string | null;
  reason: string | null;
  services_consent: boolean;
  avatar_url: string | null;
};

const STEPS = ["Personal Details", "About You", "Review"] as const;

export function ProfileSetupWizard({
  initial,
  userId,
}: {
  initial: ProfileFormValues;
  userId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ProfileFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextUrl = searchParams.get("next");
  const isLastStep = step === STEPS.length - 1;

  async function saveProfile(partial: Partial<ProfileFormValues>) {
    const next = { ...values, ...partial };
    setValues(next);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: next.full_name || null,
        pronouns: next.pronouns || null,
        age_range: next.age_range || null,
        country: next.country || null,
        gender_identity: next.gender_identity || null,
        sexual_orientation: next.sexual_orientation || null,
        relationship_status: next.relationship_status || null,
        religion_importance: next.religion_importance || null,
        spiritual: next.spiritual || null,
        prior_therapy: next.prior_therapy || null,
        reason: next.reason || null,
        services_consent: next.services_consent,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Couldn't save your details. Please try again.");
      return false;
    }
    return true;
  }

  async function handleContinue(partial: Partial<ProfileFormValues>) {
    setSaving(true);
    const ok = await saveProfile(partial);
    setSaving(false);
    if (!ok) return;
    if (isLastStep) {
      await finishSetup();
    } else {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleAvatar(file: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    let avatarUrl: string | null = null;
    if (uploadError) {
      toast.error("Couldn't upload your photo. Please try again.");
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = data.publicUrl;
      setValues((v) => ({ ...v, avatar_url: avatarUrl }));
      await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);
      toast.success("Photo updated");
    }
    setUploading(false);
  }

  async function finishSetup() {
    const { error } = await supabase
      .from("profiles")
      .update({ profile_complete: true })
      .eq("id", userId);

    if (error) {
      toast.error("Couldn't finalize your profile.");
      setSaving(false);
      return;
    }
    toast.success("Your profile is complete!");
    router.push(nextUrl ? decodeURIComponent(nextUrl) : "/profile");
    router.refresh();
  }

  function setField<K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K],
    saveNow = false,
  ) {
    if (saveNow) {
      saveProfile({ [key]: value } as Partial<ProfileFormValues>);
    } else {
      setValues((v) => ({ ...v, [key]: value }));
    }
  }

  const initials =
    values.full_name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-10 ${i <= step ? "bg-primary" : "bg-border"}`} />}
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i < step
                  ? "bg-primary/20 text-primary"
                  : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            {i === step && (
              <span className="ml-1">
                Step {step + 1} of {STEPS.length} — {label}
              </span>
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-6">
          <AvatarUploader
            initials={initials}
            avatarUrl={values.avatar_url}
            uploading={uploading}
            onPick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatar(file);
              e.target.value = "";
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="Your name"
              value={values.full_name ?? ""}
              onChange={(e) => setField("full_name", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pronouns">Pronouns</Label>
              <Input
                id="pronouns"
                placeholder="e.g. she/her, they/them"
                value={values.pronouns ?? ""}
                onChange={(e) => setField("pronouns", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age_range">Age Range</Label>
              <Select
                value={values.age_range ?? undefined}
                onValueChange={(v) => setField("age_range", v)}
              >
                <SelectTrigger id="age_range">
                  <SelectValue placeholder="Select your age range" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_RANGE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={values.country ?? undefined}
              onValueChange={(v) => setField("country", v)}
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <WizardNav
            step={step}
            saving={saving}
            onNext={() => handleContinue({})}
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Gender Identity</Label>
            <Select
              value={values.gender_identity ?? undefined}
              onValueChange={(v) => setField("gender_identity", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your gender identity" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sexual Orientation</Label>
            <Select
              value={values.sexual_orientation ?? undefined}
              onValueChange={(v) => setField("sexual_orientation", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your sexual orientation" />
              </SelectTrigger>
              <SelectContent>
                {ORIENTATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Relationship Status</Label>
            <Select
              value={values.relationship_status ?? undefined}
              onValueChange={(v) => setField("relationship_status", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your relationship status" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>How important is religion or faith in your life?</Label>
            <Select
              value={values.religion_importance ?? undefined}
              onValueChange={(v) => setField("religion_importance", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {RELIGION_IMPORTANCE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Do you consider yourself spiritual?</Label>
            <Select
              value={values.spiritual ?? undefined}
              onValueChange={(v) => setField("spiritual", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {SPIRITUAL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Have you ever been in therapy before?</Label>
            <Select
              value={values.prior_therapy ?? undefined}
              onValueChange={(v) => setField("prior_therapy", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {PRIOR_THERAPY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <WizardNav
            step={step}
            saving={saving}
            onBack={() => setStep((s) => s - 1)}
            onNext={() => handleContinue({})}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reason">
              What brings you here today?{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="reason"
              rows={4}
              placeholder="Share a little about why you're seeking support..."
              value={values.reason ?? ""}
              onChange={(e) => setField("reason", e.target.value)}
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Checkbox
              checked={values.services_consent}
              onCheckedChange={(c) => setField("services_consent", c === true)}
            />
            <Label className="text-sm leading-relaxed">
              I consent to Our Ears Are Open contacting me about services and
              support opportunities.
            </Label>
          </div>

          <div className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Almost done!</p>
            <p className="mt-1">
              Reviewing this will mark your profile as complete and let you book
              a conversation with a listener.
            </p>
          </div>

          <WizardNav
            step={step}
            saving={saving}
            onBack={() => setStep((s) => s - 1)}
            onNext={() => handleContinue({})}
            finishLabel="Finish & Continue"
          />
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        All information is kept strictly confidential and is never shared
        without your consent.
      </p>
    </div>
  );
}

function AvatarUploader({
  initials,
  avatarUrl,
  uploading,
  onPick,
}: {
  initials: string;
  avatarUrl: string | null;
  uploading: boolean;
  onPick: () => void;
}) {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onPick}
        className="group relative"
        aria-label="Upload profile photo"
      >
        <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="Profile" />
          ) : (
            <AvatarFallback className="text-3xl font-semibold text-primary">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </div>
      </button>
    </div>
  );
}

function WizardNav({
  step,
  saving,
  onNext,
  onBack,
  finishLabel = "Save & Continue",
}: {
  step: number;
  saving: boolean;
  onNext: () => void;
  onBack?: () => void;
  finishLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <div>
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={saving}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <Link
            href="/profile"
            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            Skip for now
          </Link>
        )}
      </div>
      <Button type="button" onClick={onNext} size="lg" disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="mr-2 h-4 w-4" />
        )}
        {finishLabel}
      </Button>
    </div>
  );
}
