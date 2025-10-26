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
import Analytics from "./pages/Analytics";
import ApiKeysPage from "./pages/KeyPage";
import { VerifyUserEmail } from "./pages/account/VerifyUserEmail";
import { ContactsPage } from "./pages/ConatctsPage";
import { Template } from "./pages/Templates";
import { Settings } from "./pages/Settings";
import UniBox from "./pages/UniBox";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/app/dashboard/accounts/verify" element={<VerifyUserEmail/>} />
          <Route path="/app/dashboard/accounts/connect" element={<AccountConnect/>} />
          <Route path="/app/dashboard/accounts" element={<Dashboard/>} />
          <Route path="/app/dashboard/contacts" element={<ContactsPage/>} />
          <Route path="/app/dashboard/templates" element={<Template/>} />
          <Route path="/app/dashboard/settings" element={<Settings/>} />
          <Route path="/app/dashboard/unibox" element={<UniBox/>} />
          <Route path="/app/dashboard/campaigns" element={<Campaigns/>} />
          <Route path="/app/dashboard/campaigns/details" element={<CampaignDetails/>} />
          <Route path="/app/dashboard/campaigns/create" element={<CreateCampaignForm/>} />
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/app/analytics" element={<Analytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route path="/verify-email" element={<EmailVerify/>} />
          <Route path="/keys" element={<ApiKeysPage/>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
