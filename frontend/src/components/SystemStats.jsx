import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Cpu, HardDrive } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SystemStats = () => {
  const [stats, setStats] = useState({
    cpu_percent: 0,
    memory_percent: 0,
    memory_used_gb: 0,
    memory_total_gb: 0,
    gpu_available: false,
    gpu_info: "N/A",
    active_cameras: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/system/status`);
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch system stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div data-testid="system-stats" className="flex items-center gap-4">
      <Card className="px-4 py-2 bg-zinc-900 border-zinc-800">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-blue-400" />
          <div>
            <p className="text-xs text-zinc-500">CPU</p>
            <p className="text-sm font-semibold">{stats.cpu_percent.toFixed(1)}%</p>
          </div>
        </div>
      </Card>

      <Card className="px-4 py-2 bg-zinc-900 border-zinc-800">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-purple-400" />
          <div>
            <p className="text-xs text-zinc-500">RAM</p>
            <p className="text-sm font-semibold">
              {stats.memory_used_gb} / {stats.memory_total_gb} GB
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemStats;
