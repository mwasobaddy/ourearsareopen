import { redirect } from "next/navigation";

/**
 * Alias for team member portal per scope (ourearsareopen.com/team-member or /workforce).
 * Redirects to /team-member.
 */
export default function WorkforceRedirect() {
  redirect("/team-member");
}
