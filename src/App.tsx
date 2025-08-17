import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import ArtistReports from "./pages/ArtistReports";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminPayouts from "./pages/AdminPayouts";
import AdminSettings from "./pages/AdminSettings";
import Releases from "./pages/Releases"
import NotFound from "./pages/NotFound";

// Configure React Query with better defaults for authentication
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Global error handler for React Query
queryClient.setMutationDefaults(['auth'], {
  onError: (error: any) => {
    console.error('[ReactQuery] Authentication mutation error:', error);
  },
});

const App = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[App] Global error caught:', error, errorInfo);
        // In production, send to error reporting service
        // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute requiredRole="artist">
                    <ArtistReports />
                  </ProtectedRoute>
                } />
                <Route path="/admin-users" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin-reports" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminReports />
                  </ProtectedRoute>
                } />
                <Route path="/admin-payouts" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPayouts />
                  </ProtectedRoute>
                } />
                <Route path="/admin-settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="/releases" element={
                  <ProtectedRoute requiredRole="admin">
                    <Releases />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;