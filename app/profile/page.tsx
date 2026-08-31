import type { Metadata } from "next";
import Link from "next/link";
import {
  User,
  Calendar,
  FileText,
  Settings,
  Lock,
  Bell,
  CreditCard,
  Clock,
  MessageSquare,
  Edit,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "My Profile | Our Ears Are Open",
  description: "Manage your Our Ears Are Open profile, view your conversation history, and update your settings.",
};

const upcomingSessions = [
  {
    id: 1,
    counselor: "Team Member A",
    type: "Phone Conversation",
    date: "Mon, Feb 10, 2026",
    time: "2:00 PM",
    format: "Phone",
    avatar: "TA",
  },
  {
    id: 2,
    counselor: "Team Member B",
    type: "Chat Conversation",
    date: "Wed, Feb 12, 2026",
    time: "6:00 PM",
    format: "Chat",
    avatar: "TB",
  },
];

const pastSessions = [
  {
    id: 1,
    counselor: "Team Member A",
    type: "Phone Conversation",
    date: "Jan 27, 2026",
    notes: true,
  },
  {
    id: 2,
    counselor: "Team Member A",
    type: "Chat Conversation",
    date: "Jan 20, 2026",
    notes: true,
  },
  {
    id: 3,
    counselor: "Team Member B",
    type: "Intro Conversation",
    date: "Jan 13, 2026",
    notes: false,
  },
];

const savedDocuments = [
  { name: "Intake Form", date: "Jan 13, 2026", type: "PDF" },
  { name: "Conversation Notes", date: "Jan 20, 2026", type: "PDF" },
  { name: "Conversation Notes - Jan 27", date: "Jan 27, 2026", type: "PDF" },
];

export default function ProfilePage() {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* Profile Header */}
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32">
                    <AvatarFallback className="bg-primary text-2xl text-primary-foreground md:text-3xl">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit avatar</span>
                  </Button>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                    Jordan Davis
                  </h1>
                  <p className="text-muted-foreground">jordan.davis@email.com</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                    <Badge variant="secondary">Member since Jan 2026</Badge>
                    <Badge className="bg-primary/10 text-primary">
                      4 Conversations Completed
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="mb-1 text-sm text-muted-foreground">
                      Your listening journey progress
                    </p>
                    <Progress value={40} className="h-2 w-full max-w-xs" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="conversations" className="mt-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="conversations">
                <Calendar className="mr-2 h-4 w-4 hidden sm:inline" />
                Conversations
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="mr-2 h-4 w-4 hidden sm:inline" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="info">
                <User className="mr-2 h-4 w-4 hidden sm:inline" />
                Info
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4 hidden sm:inline" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Conversations Tab */}
            <TabsContent value="conversations" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Upcoming Conversations */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Conversations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingSessions.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center gap-4 rounded-lg border border-border p-4"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {session.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                {session.counselor}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {session.type}
                              </p>
                              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {session.date} @ {session.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  {session.format === "Phone" ? (
                                    <Clock className="h-3 w-3" />
                                  ) : (
                                    <MessageSquare className="h-3 w-3" />
                                  )}
                                  {session.format}
                                </span>
                              </div>
                            </div>
                            <Button size="sm">
                              {session.format === "Phone" ? "Start Call" : "Open Chat"}
                            </Button>
                          </div>
                        ))}
                        <Link href="/book-listener">
                          <Button variant="outline" className="w-full bg-transparent">
                            Book a New Listener
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-2 text-muted-foreground">
                          No upcoming conversations
                        </p>
                        <Link href="/book-listener">
                          <Button className="mt-4">Book a Listener</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Conversation History */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Conversation History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pastSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between rounded-lg bg-secondary p-3"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {session.counselor}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.type} • {session.date}
                            </p>
                          </div>
                          {session.notes && (
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="mr-1 h-4 w-4" />
                              Notes
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Saved Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {savedDocuments.map((doc) => (
                      <div
                        key={doc.name}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {doc.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {doc.date} • {doc.type}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personal Info Tab */}
            <TabsContent value="info" className="mt-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Personal Information
                    </span>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium text-foreground">Jordan Davis</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">
                          jordan.davis@email.com
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">
                          (555) 987-6543
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Age Range</p>
                        <p className="font-medium text-foreground">25-34</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pronouns</p>
                        <p className="font-medium text-foreground">They/Them</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Assigned Team Member
                        </p>
                        <p className="font-medium text-foreground">
                          Team Member A
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
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
                            Manage email and SMS preferences
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
                          <p className="font-medium text-foreground">
                            Security
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Password, two-factor authentication
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
                            Manage cards and billing
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </CardContent>
                </Card>

                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
