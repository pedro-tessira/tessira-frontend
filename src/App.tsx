import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/modules/auth/contexts/AuthContext";
import { AuthBootstrapGate } from "@/modules/auth/components/AuthBootstrapGate";
import { TenantProvider } from "@/shared/contexts/TenantContext";
import { HealthWeightsProvider } from "@/modules/signals/contexts/HealthWeightsContext";
import { PeopleStoreProvider } from "@/modules/people/contexts/PeopleStoreContext";
import { AppRoutes } from "@/app/routing/AppRoutes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AuthBootstrapGate>
              <TenantProvider>
                <HealthWeightsProvider>
                  <PeopleStoreProvider>
                    <Toaster />
                    <Sonner />
                    <AppRoutes />
                  </PeopleStoreProvider>
                </HealthWeightsProvider>
              </TenantProvider>
            </AuthBootstrapGate>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
