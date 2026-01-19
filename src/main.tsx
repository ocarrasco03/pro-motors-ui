import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "@/app/store.ts";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Provider store={store}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </TooltipProvider>
        </Provider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
