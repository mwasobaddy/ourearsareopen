import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify Email | Our Ears Are Open",
  description: "Verify your email address.",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string; returnUrl?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token, returnUrl } = await searchParams;

  // TODO: Validate token via API; show success or error state
  const isValid = !!token;

  return (
    <section className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md px-4 text-center">
        {isValid ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Email Verified</h1>
            <p className="mt-2 text-muted-foreground">
              Your email has been verified. You can now sign in to your account.
            </p>
            <Button className="mt-6" asChild>
              <Link href={returnUrl || "/login"}>Continue to {returnUrl ? "Site" : "Login"}</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
            <p className="mt-2 text-muted-foreground">
              This verification link is invalid or has expired. Please request a new one.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/login">Back to Login</Link>
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
