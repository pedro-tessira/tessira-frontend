import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TenantProvider } from "@/shared/contexts/TenantContext";
import { HealthWeightsProvider } from "@/modules/signals/contexts/HealthWeightsContext";
import { PeopleStoreProvider } from "@/modules/people/contexts/PeopleStoreContext";
import { AppRoutes } from "@/app/routing/AppRoutes";

const queryClient = new QueryClient();

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TenantProvider>
      <HealthWeightsProvider>
      <PeopleStoreProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PeopleStoreProvider>
      </HealthWeightsProvider>
      </TenantProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
