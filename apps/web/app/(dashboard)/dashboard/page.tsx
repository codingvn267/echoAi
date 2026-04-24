import { redirect } from "next/navigation";

// The dashboard's natural landing screen is the live Inbox.
// Visiting /dashboard sends operators straight to their conversations.
export default function DashboardEntryPage() {
  redirect("/conversations");
}
