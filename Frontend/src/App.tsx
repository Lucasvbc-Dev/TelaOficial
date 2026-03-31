import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Index from "./pages/Index";
import Catalogo from "./pages/Catalogo";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import MinhaConta from "./pages/MinhaConta";
import MeusPedidos from "./pages/MeusPedidos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/minha-conta" element={<MinhaConta />} />
            <Route path="/meus-pedidos" element={<MeusPedidos />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
