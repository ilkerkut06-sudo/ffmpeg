import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SiteManagement from "@/pages/SiteManagement";
import PlateManagement from "@/pages/PlateManagement";
import CameraManagement from "@/pages/CameraManagement";
import DoorManagement from "@/pages/DoorManagement";
import Reports from "@/pages/Reports";
import SettingsPage from "@/pages/SettingsPage";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="App">
      <Toaster position="top-right" />
      <BrowserRouter>
        <div className="flex h-screen bg-zinc-950 text-zinc-100">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sites" element={<SiteManagement />} />
              <Route path="/plates" element={<PlateManagement />} />
              <Route path="/cameras" element={<CameraManagement />} />
              <Route path="/doors" element={<DoorManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
