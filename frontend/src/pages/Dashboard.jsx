import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Activity, Users, AlertTriangle, Car } from "lucide-react";
import { Card } from "@/components/ui/card";
import CameraGrid from "@/components/CameraGrid";
import DetectionLog from "@/components/DetectionLog";
import RecentDetections from "@/components/RecentDetections";
import SystemStats from "@/components/SystemStats";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_today: 0,
    allowed_today: 0,
    blocked_today: 0,
    unknown_today: 0,
  });
  const [recentDetections, setRecentDetections] = useState([]);
  const [cameras, setCameras] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/detections/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchCameras = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/cameras`);
      setCameras(response.data);
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
    }
  }, []);

  const fetchRecentDetections = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/detections/recent`);
      setRecentDetections(response.data);
    } catch (error) {
      console.error("Failed to fetch recent detections:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchCameras();
    fetchRecentDetections();

    // WebSocket connection for real-time updates
    const wsUrl = `${BACKEND_URL.replace('https', 'wss').replace('http', 'ws')}/api/ws/detections`;
    let ws;

    try {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "detection") {
          setRecentDetections((prev) => [data.data, ...prev.slice(0, 19)]);
          fetchStats();
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }

    // Polling fallback
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentDetections();
    }, 5000);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, [fetchStats, fetchCameras, fetchRecentDetections]);

  return (
    <div data-testid="dashboard" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ana Ekran</h1>
          <p className="text-zinc-400 mt-1">Plaka Tanıma İzleme Sistemi</p>
        </div>
        <SystemStats />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Toplam Giriş</p>
              <p className="text-2xl font-bold mt-1">{stats.total_today}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">İzinli Araçlar</p>
              <p className="text-2xl font-bold mt-1 text-green-400">{stats.allowed_today}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Car className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Misafirler</p>
              <p className="text-2xl font-bold mt-1 text-yellow-400">{stats.unknown_today}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Users className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Yasaklı Araçlar</p>
              <p className="text-2xl font-bold mt-1 text-red-400">{stats.blocked_today}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Grid */}
        <div className="lg:col-span-2">
          <CameraGrid cameras={cameras} />
        </div>

        {/* Recent Detections */}
        <div>
          <RecentDetections detections={recentDetections} />
        </div>
      </div>

      {/* Detection Log */}
      <DetectionLog detections={recentDetections} />
    </div>
  );
};

export default Dashboard;
