import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guards";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { AuroraBackground } from "@workspace/ui/components/aurora-background";
import { cookies } from "next/headers";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { DashboardPageTransition } from "../components/dashboard-page-transition";
import { Provider } from "jotai";

export const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <AuthGuard>
      <OrganizationGuard>
        <Provider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <DashboardSidebar />
            <main className="dashboard-aurora relative flex flex-1 flex-col">
              <AuroraBackground intensity={0.05} />
              <DashboardPageTransition>{children}</DashboardPageTransition>
            </main>
          </SidebarProvider>
        </Provider>
      </OrganizationGuard>
    </AuthGuard>
  );
};
