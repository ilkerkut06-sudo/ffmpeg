import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, DoorOpen, DoorClosed } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DoorManagement = () => {
  const [doors, setDoors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoor, setEditingDoor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    endpoint: "/kapiac",
  });

  useEffect(() => {
    fetchDoors();
  }, []);

  const fetchDoors = async () => {
    try {
      const response = await axios.get(`${API}/doors`);
      setDoors(response.data);
    } catch (error) {
      toast.error("Kapılar yüklenemedi");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoor) {
        await axios.put(`${API}/doors/${editingDoor.id}`, formData);
        toast.success("Kapı güncellendi");
      } else {
        await axios.post(`${API}/doors`, formData);
        toast.success("Kapı eklendi");
      }
      fetchDoors();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Kapıyı silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/doors/${id}`);
      toast.success("Kapı silindi");
      fetchDoors();
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const handleEdit = (door) => {
    setEditingDoor(door);
    setFormData({
      name: door.name,
      ip: door.ip,
      endpoint: door.endpoint,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingDoor(null);
    setFormData({
      name: "",
      ip: "",
      endpoint: "/kapiac",
    });
  };

  const handleTestDoor = async (id) => {
    try {
      await axios.post(`${API}/doors/${id}/open`);
      toast.success("Kapı açıldı");
    } catch (error) {
      toast.error("Kapı açılamadı: " + (error.response?.data?.detail || "Bilinmeyen hata"));
    }
  };

  return (
    <div data-testid="door-management" className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kapı Yönetimi</h1>
          <p className="text-zinc-400 mt-1">NodeMCU kontrollü kapıları yönetin</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-door-btn" onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kapı
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle>{editingDoor ? "Kapı Düzenle" : "Yeni Kapı Ekle"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="doorName">Kapı Adı</Label>
                <Input
                  id="doorName"
                  data-testid="door-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Ön Kapı"
                  required
                />
              </div>

              <div>
                <Label htmlFor="doorIp">NodeMCU IP Adresi</Label>
                <Input
                  id="doorIp"
                  data-testid="door-ip-input"
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="192.168.1.2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Select value={formData.endpoint} onValueChange={(value) => setFormData({ ...formData, endpoint: value })} required>
                  <SelectTrigger data-testid="endpoint-select" className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="/kapiac">Kapı 1 (/kapiac)</SelectItem>
                    <SelectItem value="/kapiac1">Kapı 2 (/kapiac1)</SelectItem>
                    <SelectItem value="/kapiac2">Kapı 3 (/kapiac2)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500 mt-1">Tam URL: http://{formData.ip || "192.168.1.2"}{formData.endpoint}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" data-testid="submit-door-btn" className="bg-emerald-600 hover:bg-emerald-700">
                  {editingDoor ? "Güncelle" : "Ekle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Doors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doors.length === 0 ? (
          <Card className="col-span-full p-12 bg-zinc-900 border-zinc-800">
            <div className="text-center">
              <DoorClosed className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">Henüz kapı eklenmemiş</p>
            </div>
          </Card>
        ) : (
          doors.map((door) => (
            <Card key={door.id} data-testid={`door-card-${door.id}`} className="p-6 bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <DoorOpen className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{door.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono mt-1">{door.ip}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(door)} data-testid={`edit-door-${door.id}`}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(door.id)} data-testid={`delete-door-${door.id}`} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-zinc-800/50 rounded">
                  <p className="text-xs text-zinc-500">Endpoint</p>
                  <p className="text-sm font-mono">{door.endpoint}</p>
                </div>

                <Button
                  data-testid={`test-door-${door.id}`}
                  onClick={() => handleTestDoor(door.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Kapıyı Aç (Test)
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DoorManagement;
