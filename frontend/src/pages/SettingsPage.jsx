import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Cpu, Monitor } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    engine: "yolov8_tesseract",
    compute_mode: "auto",
    camera_size: "medium",
    detection_confidence: 0.5,
  });
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchSystemStatus();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get(`${API}/system/status`);
      setSystemStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch system status:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/settings`, settings);
      toast.success("Ayarlar kaydedildi");
    } catch (error) {
      toast.error("Ayarlar kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="settings-page" className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sistem Ayarları</h1>
        <p className="text-zinc-400 mt-1">Plaka tanıma sistemini yapılandırın</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detection Engine */}
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold">Tanıma Motoru</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="engine">Motor Seçimi</Label>
                <Select value={settings.engine} onValueChange={(value) => setSettings({ ...settings, engine: value })}>
                  <SelectTrigger data-testid="engine-select" className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="yolov8_tesseract">YOLOv8 + Tesseract OCR</SelectItem>
                    <SelectItem value="yolov8_openalpr">YOLOv8 + OpenALPR</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500 mt-1">
                  {settings.engine === "yolov8_tesseract"
                    ? "Tesseract: Ücretsiz ve offline çalışır"
                    : "OpenALPR: Daha hızlı ancak lisans gerektirebilir"}
                </p>
              </div>
            </div>
          </Card>

          {/* Compute Settings */}
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Cpu className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-bold">İşlemci Ayarları</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="computeMode">İşlem Modu</Label>
                <Select value={settings.compute_mode} onValueChange={(value) => setSettings({ ...settings, compute_mode: value })}>
                  <SelectTrigger data-testid="compute-mode-select" className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="auto">Otomatik (GPU varsa kullan)</SelectItem>
                    <SelectItem value="cpu">CPU</SelectItem>
                    <SelectItem value="gpu">GPU (CUDA gerekir)</SelectItem>
                  </SelectContent>
                </Select>
                {systemStatus && (
                  <p className="text-xs text-zinc-500 mt-1">
                    GPU Durumu: {systemStatus.gpu_available ? `Mevcut (${systemStatus.gpu_info})` : "Mevcut değil"}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Display Settings */}
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Monitor className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold">Görüntü Ayarları</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cameraSize">Kamera Kutu Boyutu</Label>
                <Select value={settings.camera_size} onValueChange={(value) => setSettings({ ...settings, camera_size: value })}>
                  <SelectTrigger data-testid="camera-size-select" className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="small">Küçük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="large">Büyük</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Button
            data-testid="save-settings-btn"
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </Button>
        </div>

        {/* System Info */}
        <div>
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <h2 className="text-lg font-bold mb-4">Sistem Bilgisi</h2>
            {systemStatus && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">CPU Kullanımı</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${systemStatus.cpu_percent}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{systemStatus.cpu_percent.toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-zinc-400">RAM Kullanımı</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${systemStatus.memory_percent}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{systemStatus.memory_percent.toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {systemStatus.memory_used_gb} GB / {systemStatus.memory_total_gb} GB
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400 mb-2">GPU Durumu</p>
                  <div className={`p-3 rounded-lg ${
                    systemStatus.gpu_available ? "bg-green-500/10" : "bg-zinc-800"
                  }`}>
                    <p className={`text-sm font-medium ${
                      systemStatus.gpu_available ? "text-green-400" : "text-zinc-500"
                    }`}>
                      {systemStatus.gpu_available ? "Kullanılabilir" : "Mevcut değil"}
                    </p>
                    {systemStatus.gpu_available && (
                      <p className="text-xs text-zinc-500 mt-1">{systemStatus.gpu_info}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400 mb-2">Aktif Kameralar</p>
                  <p className="text-2xl font-bold">{systemStatus.active_cameras}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
