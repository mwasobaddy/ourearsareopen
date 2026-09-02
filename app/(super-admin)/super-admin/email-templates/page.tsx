import type { Metadata } from "next";
import { MailWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { requireSuperAdmin } from "@/lib/super-admin-auth";
import { getEmailTemplates } from "@/lib/super-admin-data";
import { EmailTemplatesEditor } from "@/components/super-admin/email-templates-editor";

export const metadata: Metadata = {
  title: "Email Templates | Super Admin | Our Ears Are Open",
  description: "Author transactional email templates.",
};

export default async function SuperAdminEmailTemplatesPage() {
  await requireSuperAdmin();
  const templates = await getEmailTemplates();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
        <p className="text-muted-foreground">
          Author subject lines and body copy for transactional emails
          (welcome, booking, reminders, receipts, session summaries).
        </p>
      </div>

      <Alert className="border-amber-300/50 bg-amber-500/10">
        <MailWarning className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-700">Delivery not yet live</AlertTitle>
        <AlertDescription className="text-amber-700/80">
          Templates are saved here but no emails are sent yet. Sending is wired
          to Resend once the client provides API credentials — see the launch
          checklist.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Transactional templates</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <EmailTemplatesEditor templates={templates} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No templates found. Run the module 11 seed to create defaults.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
