import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard_layout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DashboardLayout> {children}</DashboardLayout>
  );
};

export default Layout;
