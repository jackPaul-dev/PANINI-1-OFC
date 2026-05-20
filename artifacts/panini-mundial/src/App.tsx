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
        <Route path="/" component={Landing} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/presell" component={Pressel} />
        <Route path="/pressel" component={Pressel} />
        <Route path="/seguimiento" component={Seguimiento} />
        <Route path="/email" component={EmailPanel} />
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
