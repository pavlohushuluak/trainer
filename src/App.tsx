
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { ThemeProvider } from "@/hooks/ThemeProvider";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import { ResourcePreloader } from "@/components/performance/ResourcePreloader";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MyPetTraining from "./pages/MyPetTraining";
import Support from "./pages/Support";
import Community from "./pages/Community";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AuthCallback from "./pages/AuthCallback";
import PasswordReset from "./pages/PasswordReset";
import NotFound from "./pages/NotFound";
import AGB from "./pages/AGB";
import Datenschutz from "./pages/Datenschutz";
import Impressum from "./pages/Impressum";
import TestEmail from "./pages/TestEmail";
import TestEmailAuth from "./pages/TestEmailAuth";
import ChatDiagnosticsPage from "./pages/ChatDiagnosticsPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import ImageAnalysisPage from "./pages/ImageAnalysisPage";
import LoginPage from "./pages/LoginPage";
import SubscriptionPage from "./pages/SubscriptionPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const criticalResources = [
  { href: '/placeholder.svg', as: 'image' as const, priority: 'high' as const },
  {
    href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap',
    as: 'style' as const,
    priority: 'high' as const
  },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <ResourcePreloader resources={criticalResources} />
          <PerformanceMonitor />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Routes that use MainLayout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Index />} />
                              <Route path="dashboard" element={<Dashboard />} />
              <Route path="mein-tiertraining" element={<MyPetTraining />} />
              <Route path="training" element={<MyPetTraining />} />
                <Route path="support" element={<Support />} />
                <Route path="community" element={<Community />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="image-analysis" element={<ImageAnalysisPage />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="agb" element={<AGB />} />
                <Route path="datenschutz" element={<Datenschutz />} />
                <Route path="impressum" element={<Impressum />} />
                <Route path="test-email" element={<TestEmail />} />
                <Route path="test-email-auth" element={<TestEmailAuth />} />
                <Route path="chat-diagnostics" element={<ChatDiagnosticsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
