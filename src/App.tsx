import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SharePage from "./pages/SharePage";
import NotFound from "./pages/NotFound";
import HelpPage from "./pages/HelpPage";
import ProfilePage from "./pages/ProfilePage";
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminIndexPage from "./pages/admin";
import AdminAuthPage from "./pages/admin/AuthPage";
import AdminHrisPage from "./pages/admin/HrisPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminEventTypesPage from "./pages/admin/EventTypesPage";
import AdminAuditPage from "./pages/admin/AuditPage";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/share/:token" element={<SharePage />} />
          <Route path="/shares/:token" element={<SharePage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminIndexPage />} />
            <Route path="auth" element={<AdminAuthPage />} />
            <Route path="hris" element={<AdminHrisPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="event-types" element={<AdminEventTypesPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
