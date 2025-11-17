import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Camera } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CameraBox = ({ camera, position }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("stopped");

  const startCamera = async () => {
    // Prevent starting if already active
    if (isActive) return;
    try {
      await axios.post(`${API}/cameras/${camera.id}/start`);
      setIsActive(true);
      setStatus("monitoring");
      toast.success(`${camera.name} başlatıldı`);
    } catch (error) {
      toast.error(`${camera.name} başlatılamadı`);
      console.error(error);
    }
  };

  const stopCamera = async () => {
    // Prevent stopping if already stopped
    if (!isActive) return;
    try {
      await axios.post(`${API}/cameras/${camera.id}/stop`);
      setIsActive(false);
      setStatus("stopped");
      toast.info(`${camera.name} durduruldu`);
    } catch (error) {
      toast.error(`${camera.name} durdurulamadı`);
      console.error(error);
    }
  };

  // Auto-start camera when component mounts with a valid camera prop
  useEffect(() => {
    if (camera && !isActive) {
      startCamera();
    }
    // No cleanup function to stop camera on unmount, so it stays active
  }, [camera]); // Dependency array ensures this runs when camera prop is available

  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const statusColors = {
    monitoring: "border-zinc-700",
    allowed: "border-green-500 status-allowed",
    blocked: "border-red-500 status-blocked",
    unknown: "border-yellow-500 status-unknown",
    stopped: "border-zinc-800",
  };

  return (
    <Card
      data-testid={`camera-box-${position}`}
      className={`camera-box bg-zinc-900 border-2 ${statusColors[status]} transition-all duration-300 overflow-hidden`}
    >
      <div className="aspect-video bg-zinc-950 relative flex items-center justify-center">
        {isActive ? (
          <img
            src={`${API}/cameras/${camera.id}/stream`}
            alt={camera.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              setStatus("stopped");
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Camera className="h-12 w-12 text-zinc-700" />
            <p className="text-sm text-zinc-600">Kamera Kapalı</p>
          </div>
        )}

        {/* Status indicator */}
        {isActive && (
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-red-500 pulse" />
            <span className="text-xs font-medium">CANLI</span>
          </div>
        )}

        {/* Camera controls */}
        <div className="absolute top-2 right-2">
          <Button
            data-testid={`camera-toggle-${position}`}
            size="sm"
            variant="secondary"
            onClick={toggleCamera}
            className="bg-black/60 backdrop-blur-sm hover:bg-black/80"
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Camera info */}
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-sm">{camera.name}</h3>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>IP: {camera.url || "Demo"}</span>
          <span>Kapı: {camera.door_id || "N/A"}</span>
        </div>
      </div>
    </Card>
  );
};

const CameraGrid = ({ cameras }) => {
  const [gridCameras, setGridCameras] = useState([]);

  useEffect(() => {
    // Ensure we always show 4 camera slots
    const slots = Array(4).fill(null);
    cameras.slice(0, 4).forEach((cam, idx) => {
      slots[cam.position || idx] = cam;
    });
    setGridCameras(slots);
  }, [cameras]);

  return (
    <div data-testid="camera-grid" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Kamera İzleme</h2>
        <div className="text-sm text-zinc-400">{cameras.length} / 4 Kamera</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gridCameras.map((camera, idx) =>
          camera ? (
            <CameraBox key={camera.id} camera={camera} position={idx} />
          ) : (
            <Card
              key={idx}
              data-testid={`empty-camera-slot-${idx}`}
              className="camera-box bg-zinc-900/50 border-2 border-dashed border-zinc-800"
            >
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-600">Kamera Eklenmedi</p>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-zinc-600">Slot {idx + 1}</p>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default CameraGrid;
