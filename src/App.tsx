import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ArtistFinances from "./pages/ArtistFinances";
import ArtistReports from "./pages/ArtistReports";
import AdminUsers from "./pages/AdminUsers";
import AdminFinances from "./pages/AdminFinances";
import AdminReports from "./pages/AdminReports";
import AdminPayouts from "./pages/AdminPayouts";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/finances" element={<ArtistFinances />} />
            <Route path="/reports" element={<ArtistReports />} />
            <Route path="/admin-users" element={<AdminUsers />} />
            <Route path="/admin-finances" element={<AdminFinances />} />
            <Route path="/admin-reports" element={<AdminReports />} />
            <Route path="/admin-payouts" element={<AdminPayouts />} />
            <Route path="/admin-settings" element={<AdminSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
