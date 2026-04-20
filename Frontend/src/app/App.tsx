import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/layouts/AppLayout";
import { AuthProvider, useAuth } from "@/features/auth/context/AuthContext";
import { NotificationsProvider } from "@/features/notifications/context/NotificationsContext";
import FeedPage from "@/pages/FeedPage";
import JobsPage from "@/pages/JobsPage";
import ProfilePage from "@/pages/ProfilePage";
import NetworkPage from "@/pages/NetworkPage";
import MessagesPage from "@/pages/MessagesPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import LoginPage from "@/pages/LoginPage";
import EmployerDashboard from "@/pages/employer/EmployerDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (user.role === "employer") {
    return (
      <NotificationsProvider role="employer">
        <Routes>
          <Route path="/employer" element={<EmployerDashboard />} />
          <Route path="*" element={<Navigate to="/employer" replace />} />
        </Routes>
      </NotificationsProvider>
    );
  }

  if (user.role === "admin") {
    return (
      <NotificationsProvider role="admin">
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </NotificationsProvider>
    );
  }

  return (
    <NotificationsProvider role="seeker">
      <AppLayout>
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </NotificationsProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;