import { Link, useLocation } from "react-router-dom";
import { Home, Building2, FileText, Camera, DoorOpen, BarChart3, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: Home, label: "Ana Ekran" },
    { path: "/sites", icon: Building2, label: "Site Tanımlama" },
    { path: "/plates", icon: FileText, label: "Plaka Yönetimi" },
    { path: "/cameras", icon: Camera, label: "Kamera Yönetimi" },
    { path: "/doors", icon: DoorOpen, label: "Kapı Yönetimi" },
    { path: "/reports", icon: BarChart3, label: "Raporlar" },
    { path: "/settings", icon: Settings, label: "Ayarlar" },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <Button
        data-testid="sidebar-toggle-btn"
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-zinc-800">
            <h1 className="text-xl font-bold text-emerald-400">
              Evo Teknoloji
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Plaka Tanıma Sistemi</p>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500 pulse" />
              <span>Sistem Aktif</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
