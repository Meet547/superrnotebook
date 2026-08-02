import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";

// Dashboard Imports
import DashboardLayout from "./components/DashboardLayout.tsx";
import Chat from "./pages/dashboard/Chat.tsx";
import Quiz from "./pages/dashboard/Quiz.tsx";
import Community from "./pages/dashboard/Community.tsx";
import LibraryComponent from "./pages/dashboard/Library.tsx";
import Settings from "./pages/dashboard/Settings.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,    // 10 min — don't re-fetch if data is fresh
      gcTime: 1000 * 60 * 30,       // 30 min — keep data in memory across tab switches
      retry: 1,
      refetchOnWindowFocus: false,   // Biggest perf win: stop re-fetching on every tab switch
      refetchOnReconnect: true,      // Still refresh when coming back online
    },
  },
});

const LoadingScreen = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#fdfaf5]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-[#fa7533]/20 border-t-[#fa7533] animate-spin" />
      <p className="font-handwritten text-2xl text-[#382618]/50 font-bold">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // While checking session, show a loading screen
  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/main" replace /> : <Login />}
      />

      {/* Nested Dashboard Routes */}
      <Route
        path="/main"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="chat" replace />} />
        <Route path="chat" element={<Chat />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="community" element={<Community />} />
        <Route path="library" element={<LibraryComponent />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
