"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  FileText,
  Settings,
  Lock,
  Bell,
  CreditCard,
  Camera,
  Loader2,
  Edit,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export type ProfileData = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
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
  assigned_listener_id: string | null;
  profile_complete: boolean;
  created_at: string | null;
};

export function ProfileView({ profile }: { profile: ProfileData }) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const initials =
    profile.full_name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

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
    const path = `${profile.id}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Couldn't upload your photo. Please try again.");
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatar(data.publicUrl);
      await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", profile.id);
      toast.success("Photo updated");
    }
    setUploading(false);
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "This will permanently delete your account and all associated data. Continue?",
      )
    ) {
      return;
    }
    setDeleting(true);
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      toast.error("Couldn't delete your account. Please try again.");
      setDeleting(false);
      return;
    }
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Profile Header */}
      <Card className="border-border">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                {avatar ? (
                  <AvatarImage src={avatar} alt="Profile avatar" />
                ) : (
                  <AvatarFallback className="bg-primary text-2xl text-primary-foreground md:text-3xl">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary shadow"
                aria-label="Edit avatar"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
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
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                {profile.full_name || "Your Profile"}
              </h1>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                {memberSince && (
                  <Badge variant="secondary">Member since {memberSince}</Badge>
                )}
                {profile.profile_complete ? (
                  <Badge className="bg-primary/10 text-primary">
                    Profile complete
                  </Badge>
                ) : (
                  <Badge variant="outline">Profile incomplete</Badge>
                )}
              </div>
              <div className="mt-4">
                <p className="mb-1 text-sm text-muted-foreground">
                  Your listening journey progress
                </p>
                <Progress
                  value={profile.profile_complete ? 100 : 40}
                  className="h-2 w-full max-w-xs"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile/setup">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="conversations" className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversations">
            <Calendar className="mr-2 hidden h-4 w-4 sm:inline" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 hidden h-4 w-4 sm:inline" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="info">
            <User className="mr-2 hidden h-4 w-4 sm:inline" />
            Info
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 hidden h-4 w-4 sm:inline" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-6">
          <Card className="border-border text-center">
            <CardContent className="py-10">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-3 text-muted-foreground">
                No conversations yet. Book your first one to get started.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/book-listener">Book a Listener</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card className="border-border text-center">
            <CardContent className="py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-3 text-muted-foreground">
                No saved documents yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile/setup">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <InfoField label="Full Name" value={profile.full_name || "—"} />
                <InfoField label="Email" value={profile.email || "—"} />
                <InfoField label="Phone" value={profile.phone || "—"} />
                <InfoField label="Pronouns" value={profile.pronouns || "—"} />
                <InfoField label="Age Range" value={profile.age_range || "—"} />
                <InfoField label="Country" value={profile.country || "—"} />
                <InfoField
                  label="Gender Identity"
                  value={profile.gender_identity || "—"}
                />
                <InfoField
                  label="Sexual Orientation"
                  value={profile.sexual_orientation || "—"}
                />
                <InfoField
                  label="Relationship Status"
                  value={profile.relationship_status || "—"}
                />
                <InfoField
                  label="Religion"
                  value={profile.religion_importance || "—"}
                />
                <InfoField label="Spiritual" value={profile.spiritual || "—"} />
                <InfoField
                  label="Prior Therapy"
                  value={profile.prior_therapy || "—"}
                />
              </div>
              {profile.reason && (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    Why you're here
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {profile.reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="space-y-4">
            <Card className="border-border">
              <CardContent className="p-0">
                <button className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Notifications
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Email and SMS preferences
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-0">
                <button className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Security</p>
                      <p className="text-sm text-muted-foreground">
                        Password and sign-in
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-0">
                <button className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Payment Methods
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Manage cards and billing (coming soon)
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-0">
                <Link
                  href="/forgot-password"
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Change Password
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reset your current password
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Account
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
