import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | Our Ears Are Open",
  description: "Reset your password. Enter your email to receive a reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <section className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <ForgotPasswordForm className="mt-6" />
      </div>
    </section>
  );
}
