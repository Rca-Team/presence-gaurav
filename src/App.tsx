
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Attendance from "./pages/Attendance";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import NotificationDemo from './pages/NotificationDemo';
import SplashAnimation from "./components/SplashAnimation";
import { AttendanceProvider } from './contexts/AttendanceContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './hooks/use-theme';
import MobileSidebar from "./components/MobileSidebar";

const queryClient = new QueryClient();

// This component wraps our routes with AnimatePresence for exit animations
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/contact" element={<Contact />} />
        <Route path="/notifications" element={
          <ProtectedRoute requireAdmin>
            <NotificationDemo />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AttendanceProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              
              {/* Splash Animation */}
              {showSplash && (
                <SplashAnimation 
                  onComplete={() => setShowSplash(false)}
                  duration={3000} 
                />
              )}
              
              <BrowserRouter>
                <AnimatedRoutes />
                <MobileSidebar />
              </BrowserRouter>
            </TooltipProvider>
          </AttendanceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
