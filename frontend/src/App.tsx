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
import SettingsPage from "./pages/settings/SettingsPage";
import UniBox from "./pages/UniBox";
import { Crm } from "./pages/Crm";
import CustomConnect from "./pages/account/CustomConnect";
import { PreWarmedDomainSelect } from "./pages/account/PreWarmedDomainSelect";
import { PreWarmedOrder } from "./pages/account/PreWarmedOrder";


import { ProtectedRoute } from "./ProtectedRoute";
import EmailAccounts from "./pages/EmailAccounts";
import { CreditsPage } from "./pages/CreditsPage";
import { EmailWarmupPage } from "./pages/EmailWarmup";
import DomainsPage from "./pages/domain/DomainsPage";
import PurchaseDomainPage from "./pages/domain/PurchaseDomainPage";
import DomainCartPage from "./pages/domain/DomainCartPage";
import PurchasedDomainsPage from "./pages/preWarmedDomains/PurchasedDomainsPage";
import DomainDetailsPage from "./pages/preWarmedDomains/DomainDetailsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/verify-email" element={<EmailVerify />} />
          <Route path="/keys" element={<ApiKeysPage />} />

          {/* ✅ PROTECTED ROUTES */}
          <Route
            path="/app/dashboard/accounts/verify"
            element={
              <ProtectedRoute>
                <VerifyUserEmail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/accounts/connect"
            element={
              <ProtectedRoute>
                <AccountConnect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/accounts/connect/custom"
            element={
              <ProtectedRoute>
                <CustomConnect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/accounts/pre-warmed/select"
            element={
              <ProtectedRoute>
                <PreWarmedDomainSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/accounts/pre-warmed/order"
            element={
              <ProtectedRoute>
                <PreWarmedOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/accounts"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/contacts"
            element={
              <ProtectedRoute>
                <ContactsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/templates"
            element={
              <ProtectedRoute>
                <Template />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/unibox"
            element={
              <ProtectedRoute>
                <UniBox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/campaigns"
            element={
              <ProtectedRoute>
                <Campaigns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/campaigns/details"
            element={
              <ProtectedRoute>
                <CampaignDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/campaigns/create"
            element={
              <ProtectedRoute>
                <CreateCampaignForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/credits"
            element={
              <ProtectedRoute>
                <CreditsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/email-warmup"
            element={
              <ProtectedRoute>
                <EmailWarmupPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/domains"
            element={
              <ProtectedRoute>
                <DomainsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/purchase-domain"
            element={
              <ProtectedRoute>
                <PurchaseDomainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/purchase-domain/domain-cart"
            element={
              <ProtectedRoute>
                <DomainCartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/email-accounts"
            element={
              <ProtectedRoute>
                <EmailAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/crm"
            element={
              <ProtectedRoute>
                <Crm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/purchased-domains"
            element={
              <ProtectedRoute>
                <PurchasedDomainsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard/purchased-domains/:id"
            element={
              <ProtectedRoute>
                <DomainDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* CATCH-ALL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
