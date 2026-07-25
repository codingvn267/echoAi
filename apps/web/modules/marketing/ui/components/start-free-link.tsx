import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const DASHBOARD_URL = "/conversations";

// Auth-aware primary CTA used across marketing surfaces (header, guides, CTAs).
// Signed-out visitors start the free trial at /sign-up; already signed-in users
// go straight to the dashboard. Without this gate, Clerk bounces a signed-in
// user who lands on /sign-up back to the homepage, which looks like a dead link.
export const StartFreeLink = ({
  className,
  withArrow = false,
}: {
  className?: string;
  withArrow?: boolean;
}) => {
  const arrow = withArrow ? <ArrowRight className="size-4" /> : null;

  return (
    <>
      <SignedOut>
        <Link href="/sign-up" className={className}>
          Start free {arrow}
        </Link>
      </SignedOut>
      <SignedIn>
        <Link href={DASHBOARD_URL} className={className}>
          Open dashboard {arrow}
        </Link>
      </SignedIn>
    </>
  );
};
