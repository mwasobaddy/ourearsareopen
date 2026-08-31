import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Org Config | Super Admin | Our Ears Are Open",
  description: "Organisation and tenant configuration.",
};

export default function SuperAdminConfigPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organisation Config</h1>
        <p className="text-muted-foreground">Global platform settings and branding.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organisation Name</Label>
              <Input id="orgName" placeholder="Our Ears Are Open" defaultValue="Our Ears Are Open" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input id="supportEmail" type="email" placeholder="support@ourearsareopen.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input id="logo" placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" placeholder="America/New_York" defaultValue="America/New_York" />
          </div>
          <Button>Save changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crisis Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crisis988">988 Suicide & Crisis Lifeline</Label>
            <Input id="crisis988" defaultValue="https://988lifeline.org" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crisisText">Crisis Text Line</Label>
            <Input id="crisisText" defaultValue="https://www.crisistextline.org" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crisisCustom">Additional custom links (JSON)</Label>
            <Textarea id="crisisCustom" rows={3} placeholder='[{"label":"...","url":"..."}]' />
          </div>
          <Button variant="outline">Save crisis links</Button>
        </CardContent>
      </Card>
    </div>
  );
}
