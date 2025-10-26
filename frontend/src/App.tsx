import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import EmailVerify from "./pages/EmailVerify";
import { Dashboard } from "./pages/Dashboard";
import AccountConnect from "./pages/account/AccountConnect";
import { Campaigns } from "./pages/Campaigns";
import { CreateCampaignForm } from "./pages/campaigns/CreateCampaign";
import { CampaignDetails } from "./pages/campaigns/CampaignDetails";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/app/dashboard/accounts/connect" element={<AccountConnect/>} />
          <Route path="/app/dashboard/accounts" element={<Dashboard/>} />
          <Route path="/app/dashboard/campaigns" element={<Campaigns/>} />
          <Route path="/app/dashboard/campaigns/details" element={<CampaignDetails/>} />
          <Route path="/app/dashboard/campaigns/create" element={<CreateCampaignForm/>} />
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route path="/verify-email" element={<EmailVerify/>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
