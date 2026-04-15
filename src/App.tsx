import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { MarketProvider } from "@/context/MarketContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Contractors from "./pages/Contractors";
import ContractorProfile from "./pages/ContractorProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Contact from "./pages/Contact";
import ClientOverview from "./pages/client/ClientOverview";
import ClientSubscription from "./pages/client/ClientSubscription";
import ClientListings from "./pages/client/ClientListings";
import ClientApplications from "./pages/client/ClientApplications";
import ClientPayments from "./pages/client/ClientPayments";
import ClientSaved from "./pages/client/ClientSaved";
import ClientReviews from "./pages/client/ClientReviews";
import ClientSettings from "./pages/client/ClientSettings";
import Messages from "./pages/Messages";
import CountrySelect from "./pages/CountrySelect";
import Welcome from "./pages/Welcome";
import ContractorOverview from "./pages/contractor/ContractorOverview";
import ContractorEditProfile from "./pages/contractor/ContractorEditProfile";
import ContractorSubscription from "./pages/contractor/ContractorSubscription";
import ContractorJobs from "./pages/contractor/ContractorJobs";
import ContractorApplications from "./pages/contractor/ContractorApplications";
import ContractorEarnings from "./pages/contractor/ContractorEarnings";
import ContractorReviews from "./pages/contractor/ContractorReviews";
import ContractorSettings from "./pages/contractor/ContractorSettings";
import ContractorAvailability from "./pages/contractor/ContractorAvailability";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminTrades from "./pages/admin/AdminTrades";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MarketProvider>
      <AuthProvider>
        <SocketProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Index />} />
                <Route path="/contractors" element={<Contractors />} />
                <Route path="/contractors/:id" element={<ContractorProfile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/messages" element={<ProtectedRoute allowedRoles={["client", "contractor"]}><Messages /></ProtectedRoute>} />

                {/* Client Dashboard */}
                <Route path="/dashboard/client" element={<ProtectedRoute allowedRoles={["client"]}><ClientOverview /></ProtectedRoute>} />
                <Route path="/dashboard/client/subscription" element={<ProtectedRoute allowedRoles={["client"]}><ClientSubscription /></ProtectedRoute>} />
                <Route path="/dashboard/client/listings" element={<ProtectedRoute allowedRoles={["client"]}><ClientListings /></ProtectedRoute>} />
                <Route path="/dashboard/client/applications" element={<ProtectedRoute allowedRoles={["client"]}><ClientApplications /></ProtectedRoute>} />
                <Route path="/dashboard/client/payments" element={<ProtectedRoute allowedRoles={["client"]}><ClientPayments /></ProtectedRoute>} />
                <Route path="/dashboard/client/saved" element={<ProtectedRoute allowedRoles={["client"]}><ClientSaved /></ProtectedRoute>} />
                <Route path="/dashboard/client/reviews" element={<ProtectedRoute allowedRoles={["client"]}><ClientReviews /></ProtectedRoute>} />
                <Route path="/dashboard/client/settings" element={<ProtectedRoute allowedRoles={["client"]}><ClientSettings /></ProtectedRoute>} />

                {/* Contractor Dashboard */}
                <Route path="/dashboard/contractor" element={<ProtectedRoute allowedRoles={["contractor"]}><ContractorOverview /></ProtectedRoute>} />
                <Route path="/dashboard/contractor/profile" element={<ProtectedRoute allowedRoles={["contractor"]}><ContractorEditProfile /></ProtectedRoute>} />
                <Route path="/dashboard/contractor/jobs" element={<ProtectedRoute allowedRoles={["contractor"]}><ContractorJobs /></ProtectedRoute>} />
                <Route path="/dashboard/contractor/applications" element={<ProtectedRoute allowedRoles={["contractor"]}><ContractorApplications /></ProtectedRoute>} />
                <Route path="/dashboard/contractor/subscription" element={<ProtectedRoute allowedRoles={["contractor"]}><ContractorSubscription /></ProtectedRoute>} />
                <Route path="/dashboard/contractor/earnings" element={<ProtectedRoute allowedRoles={["contractor"]}><ContractorEarnings /></ProtectedRoute>} />
                <Route path="/dashboard/contractor/reviews" element={<ProtectedRoute allowedRoles={["contractor"]}><ContractorReviews /></ProtectedRoute>} />
                <Route path="/dashboard/contractor/availability" element={<ProtectedRoute allowedRoles={["contractor"]}><ContractorAvailability /></ProtectedRoute>} />
                <Route path="/dashboard/contractor/settings" element={<ProtectedRoute allowedRoles={["contractor"]}><ContractorSettings /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOverview /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminJobs /></ProtectedRoute>} />
                <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminApplications /></ProtectedRoute>} />
                <Route path="/admin/verifications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminVerifications /></ProtectedRoute>} />
                <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSubscriptions /></ProtectedRoute>} />
                <Route path="/admin/promo-codes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPromoCodes /></ProtectedRoute>} />
                <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPayments /></ProtectedRoute>} />
                <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReviews /></ProtectedRoute>} />
                <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCategories /></ProtectedRoute>} />
                <Route path="/admin/trades" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTrades /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />

                <Route path="/onboarding/welcome" element={<Welcome />} />
              <Route path="/onboarding/country" element={<CountrySelect />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SocketProvider>
      </AuthProvider>
    </MarketProvider>
  </QueryClientProvider>
);

export default App;
