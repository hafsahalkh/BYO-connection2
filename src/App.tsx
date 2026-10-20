import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SpecodeIframeTracker } from "@/components/layout/SpecodeIframeTracker";
import { HIPAABanner } from "@/components/layout/HIPAABanner";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { LandingPage } from "@/pages/LandingPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { SignupPage } from "@/pages/SignupPage";
import { LoginPage } from "@/pages/LoginPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { IntakeFunnelPage } from "@/pages/IntakeFunnelPage";
import { IntakeCompletePage } from "@/pages/IntakeCompletePage";
import { OrdersPage } from "@/pages/OrdersPage";

export default function App() {
  return (
    <BrowserRouter>
      <SpecodeIframeTracker />
      <HIPAABanner />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:slug" element={<ProductDetailPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/intake/complete"
          element={
            <RequireAuth>
              <IntakeCompletePage />
            </RequireAuth>
          }
        />
        <Route
          path="/intake"
          element={
            <RequireAuth>
              <IntakeFunnelPage />
            </RequireAuth>
          }
        />
        <Route
          path="/intake/:step"
          element={
            <RequireAuth>
              <IntakeFunnelPage />
            </RequireAuth>
          }
        />

        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  ;
}
