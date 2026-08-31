import { redirect } from "next/navigation";

// Alias: /listener redirects to /team-member per requirements
export default function ListenerPage() {
  redirect("/team-member");
}
