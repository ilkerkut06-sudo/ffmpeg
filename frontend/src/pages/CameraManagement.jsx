import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Camera, Video } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CameraManagement = () => {
  const [cameras, setCameras] = useState([]);
  const [doors, setDoors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "webcam",
    url: "",
    door_id: "",
    fps: 15,
    position: 0,
  });

  useEffect(() => {
    fetchCameras();
    fetchDoors();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await axios.get(`${API}/cameras`);
      setCameras(response.data);
    } catch (error) {
      toast.error("Kameralar yüklenemedi");
    }
  };

  const fetchDoors = async () => {
    try {
      const response = await axios.get(`${API}/doors`);
      setDoors(response.data);
    } catch (error) {
      console.error("Failed to fetch doors:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCamera) {
        await axios.put(`${API}/cameras/${editingCamera.id}`, formData);
        toast.success("Kamera güncellendi");
      } else {
        await axios.post(`${API}/cameras`, formData);
        toast.success("Kamera eklendi");
      }
      fetchCameras();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Kamerayı silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/cameras/${id}`);
      toast.success("Kamera silindi");
      fetchCameras();
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const handleEdit = (camera) => {
    setEditingCamera(camera);
    setFormData({
      name: camera.name,
      type: camera.type,
      url: camera.url,
      door_id: camera.door_id,
      fps: camera.fps,
      position: camera.position,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCamera(null);
    setFormData({
      name: "",
      type: "webcam",
      url: "",
      door_id: "",
      fps: 15,
      position: 0,
    });
  };

  return (
    <div data-testid="camera-management" className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kamera Yönetimi</h1>
          <p className="text-zinc-400 mt-1">Kamera ekleyin ve yapılandırın</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-camera-btn" onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kamera
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle>{editingCamera ? "Kamera Düzenle" : "Yeni Kamera Ekle"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cameraName">Kamera Adı</Label>
                <Input
                  id="cameraName"
                  data-testid="camera-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Ön Kapı Kamerası"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cameraType">Kamera Tipi</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })} required>
                    <SelectTrigger data-testid="camera-type-select" className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="webcam">Webcam</SelectItem>
                      <SelectItem value="rtsp">RTSP</SelectItem>
                      <SelectItem value="http">HTTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fps">FPS</Label>
                  <Input
                    id="fps"
                    data-testid="fps-input"
                    type="number"
                    value={formData.fps}
                    onChange={(e) => setFormData({ ...formData, fps: parseInt(e.target.value) })}
                    className="bg-zinc-800 border-zinc-700"
                    min="5"
                    max="30"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cameraUrl">Kamera URL/IP</Label>
                <Input
                  id="cameraUrl"
                  data-testid="camera-url-input"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="rtsp://192.168.1.100:554/stream"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="door">Bağlı Kapı</Label>
                  <Select value={formData.door_id} onValueChange={(value) => setFormData({ ...formData, door_id: value })} required>
                    <SelectTrigger data-testid="door-select" className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Kapı seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {doors.map(door => (
                        <SelectItem key={door.id} value={door.id}>{door.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="position">Grid Pozisyonu</Label>
                  <Select value={formData.position.toString()} onValueChange={(value) => setFormData({ ...formData, position: parseInt(value) })} required>
                    <SelectTrigger data-testid="position-select" className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="0">Pozisyon 1</SelectItem>
                      <SelectItem value="1">Pozisyon 2</SelectItem>
                      <SelectItem value="2">Pozisyon 3</SelectItem>
                      <SelectItem value="3">Pozisyon 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" data-testid="submit-camera-btn" className="bg-emerald-600 hover:bg-emerald-700">
                  {editingCamera ? "Güncelle" : "Ekle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cameras List */}
      <div className="space-y-3">
        {cameras.length === 0 ? (
          <Card className="p-12 bg-zinc-900 border-zinc-800">
            <div className="text-center">
              <Video className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">Henüz kamera eklenmemiş</p>
            </div>
          </Card>
        ) : (
          cameras.map((camera) => (
            <Card key={camera.id} data-testid={`camera-card-${camera.id}`} className="p-4 bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Camera className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">{camera.name}</h3>
                    <p className="text-sm text-zinc-500">Tip: {camera.type.toUpperCase()} | FPS: {camera.fps}</p>
                    <p className="text-sm text-zinc-600 font-mono">{camera.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">Bağlı Kapı</p>
                    <p className="text-sm">{doors.find(d => d.id === camera.door_id)?.name || "N/A"}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                      Pozisyon {camera.position + 1}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(camera)} data-testid={`edit-camera-${camera.id}`}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(camera.id)} data-testid={`delete-camera-${camera.id}`} className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CameraManagement;
