import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Checkout from "@/pages/checkout";
import Pressel from "@/pages/pressel";
import Seguimiento from "@/pages/seguimiento";
import EmailPanel from "@/pages/emailpanel";
import ComingSoon from "@/pages/ComingSoon";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import ReturnPolicy from "@/pages/ReturnPolicy";
import ItalyLanding from "@/pages/countries/italy/landing";
import ItalyPresell from "@/pages/countries/italy/presell";
import ItalyCheckout from "@/pages/countries/italy/checkout";
import ItalySeguimiento from "@/pages/countries/italy/tracking";
import { pixelPageView } from "@/lib/pixel";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function PixelPageTracker() {
  const [location] = useLocation();
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    pixelPageView();
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <PixelPageTracker />
      <Switch>
        {/* ── USA (root — active) ── */}
        <Route path="/" component={Landing} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/presell" component={Pressel} />
        <Route path="/pressel" component={Pressel} />
        <Route path="/seguimiento" component={Seguimiento} />
        <Route path="/tracking" component={Seguimiento} />
        <Route path="/email" component={EmailPanel} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfUse} />
        <Route path="/returns" component={ReturnPolicy} />

        {/* ── ITALY ── */}
        <Route path="/italy" component={ItalyLanding} />
        <Route path="/italy/presell" component={ItalyPresell} />
        <Route path="/italy/pressel" component={ItalyPresell} />
        <Route path="/italy/checkout" component={ItalyCheckout} />
        <Route path="/italy/seguimiento" component={ItalySeguimiento} />
        <Route path="/italy/tracking" component={ItalySeguimiento} />

        {/* ── SPAIN ── */}
        <Route path="/spain">
          <ComingSoon country="España" flag="🇪🇸" language="Español" currency="EUR" />
        </Route>

        {/* ── FRANCE ── */}
        <Route path="/france">
          <ComingSoon country="France" flag="🇫🇷" language="Français" currency="EUR" />
        </Route>

        {/* ── BRAZIL ── */}
        <Route path="/brazil">
          <ComingSoon country="Brasil" flag="🇧🇷" language="Português" currency="BRL" />
        </Route>

        {/* ── MEXICO ── */}
        <Route path="/mexico">
          <ComingSoon country="México" flag="🇲🇽" language="Español" currency="MXN" />
        </Route>

        {/* ── GERMANY ── */}
        <Route path="/germany">
          <ComingSoon country="Deutschland" flag="🇩🇪" language="Deutsch" currency="EUR" />
        </Route>

        {/* ── PORTUGAL ── */}
        <Route path="/portugal">
          <ComingSoon country="Portugal" flag="🇵🇹" language="Português" currency="EUR" />
        </Route>

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
