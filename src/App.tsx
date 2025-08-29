import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApiProvider } from "@/contexts/ApiContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TicketManager from "./components/dashboard/TicketManager";
import HistoryView from "./components/dashboard/HistoryView";
import GuideScore from "./components/dashboard/GuideScore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ApiProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<TicketManager />} />
                <Route path="history" element={<HistoryView />} />
                <Route path="guide-score" element={<GuideScore />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ApiProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
