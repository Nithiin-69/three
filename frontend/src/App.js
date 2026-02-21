import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPageNew from "./pages/LandingPageNew";
import DashboardPrime from "./pages/DashboardPrime";
import CandidatesPrime from "./pages/CandidatesPrime";
import JobsPrime from "./pages/JobsPrime";
import ScreeningPrime from "./pages/ScreeningPrime";
import EmailsPrime from "./pages/EmailsPrime";
import CalendarPrime from "./pages/CalendarPrime";
import History from "./pages/History";
import { Toaster } from "./components/ui/sonner";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPageNew />} />
      <Route path="/dashboard" element={<DashboardPrime />} />
      <Route path="/candidates" element={<CandidatesPrime />} />
      <Route path="/jobs" element={<JobsPrime />} />
      <Route path="/screening" element={<ScreeningPrime />} />
      <Route path="/emails" element={<EmailsPrime />} />
      <Route path="/calendar" element={<CalendarPrime />} />
      <Route path="/history" element={<History />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
