import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import ArtistFinances from "./pages/ArtistFinances";
import ArtistReports from "./pages/ArtistReports";
import AdminUsers from "./pages/AdminUsers";
import AdminFinances from "./pages/AdminFinances";
import AdminReports from "./pages/AdminReports";
import AdminPayouts from "./pages/AdminPayouts";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
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
              <Route path="/finances" element={
                <ProtectedRoute requiredRole="artist">
                  <ArtistFinances />
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
              <Route path="/admin-finances" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminFinances />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;