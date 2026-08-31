"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ResetPasswordFormProps {
  token?: string;
  className?: string;
}

export function ResetPasswordForm({ token, className }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return;
    setIsLoading(true);
    // TODO: POST /api/auth/reset-password with token
    await new Promise((r) => setTimeout(r, 500));
    setSubmitted(true);
    setIsLoading(false);
  }

  if (!token) {
    return (
      <div className={cn("rounded-lg border border-destructive/50 bg-destructive/10 p-4", className)}>
        <p className="text-sm font-medium text-destructive">Invalid or missing reset token</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please request a new password reset link.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <a href="/forgot-password">Request New Link</a>
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={cn("rounded-lg border border-border bg-muted/50 p-4", className)}>
        <p className="text-sm font-medium text-foreground">Password reset successfully</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You can now log in with your new password.
        </p>
        <Button className="mt-4" asChild>
          <a href="/login">Go to Login</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || password !== confirmPassword}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}
