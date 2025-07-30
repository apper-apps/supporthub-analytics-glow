import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import PageHeader from "@/components/organisms/PageHeader";
import { useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  
const getPageInfo = () => {
    switch (location.pathname) {
      case "/":
        return {
          title: "Dashboard",
          subtitle: "Support team analytics and monitoring overview"
        };
      case "/apps":
        return {
          title: "Apps Overview",
          subtitle: "Monitor all applications and their current status"
        };
      case "/users":
        return {
          title: "Users",
          subtitle: "Manage and monitor user accounts and activity"
        };
      case "/logs":
        return {
          title: "AI Logs",
          subtitle: "Chat analysis logs and user interaction insights"
        };
      case "/profile":
        return {
          title: "My Profile",
          subtitle: "Manage your account settings and preferences"
        };
      default:
        if (location.pathname.startsWith("/users/")) {
          return {
            title: "User Dashboard",
            subtitle: "Detailed user profile and application overview"
          };
        }
        return {
          title: "SupportHub Analytics",
          subtitle: "Support team dashboard"
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-64">
        <PageHeader 
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onRefresh={() => window.location.reload()}
        />
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;