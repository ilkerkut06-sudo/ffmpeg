import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Car, Search } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PlateManagement = () => {
  const [plates, setPlates] = useState([]);
  const [sites, setSites] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlate, setEditingPlate] = useState(null);
  const [selectedSite, setSelectedSite] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    site_id: "",
    block_name: "",
    apartment_number: "",
    owner_name: "",
    plates: [""],
    valid_until: "",
    status: "allowed",
  });

  useEffect(() => {
    fetchPlates();
    fetchSites();
  }, []);

  const fetchPlates = async () => {
    try {
      const response = await axios.get(`${API}/plates`);
      setPlates(response.data);
    } catch (error) {
      toast.error("Plakalar yüklenemedi");
    }
  };

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API}/sites`);
      setSites(response.data);
    } catch (error) {
      console.error("Failed to fetch sites:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.plates.filter(p => p.trim()).length === 0) {
      toast.error("En az bir plaka girmelisiniz");
      return;
    }

    const cleanedPlates = formData.plates.filter(p => p.trim());
    const submitData = { ...formData, plates: cleanedPlates };

    try {
      if (editingPlate) {
        await axios.put(`${API}/plates/${editingPlate.id}`, submitData);
        toast.success("Plaka güncellendi");
      } else {
        await axios.post(`${API}/plates`, submitData);
        toast.success("Plaka eklendi");
      }
      fetchPlates();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Plaka kaydını silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/plates/${id}`);
      toast.success("Plaka silindi");
      fetchPlates();
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const handleEdit = (plate) => {
    setEditingPlate(plate);
    setFormData({
      site_id: plate.site_id,
      block_name: plate.block_name,
      apartment_number: plate.apartment_number,
      owner_name: plate.owner_name,
      plates: [...plate.plates, "", ""].slice(0, 3),
      valid_until: plate.valid_until,
      status: plate.status,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPlate(null);
    setFormData({
      site_id: "",
      block_name: "",
      apartment_number: "",
      owner_name: "",
      plates: [""],
      valid_until: "",
      status: "allowed",
    });
  };

  const addPlateInput = () => {
    if (formData.plates.length < 3) {
      setFormData({ ...formData, plates: [...formData.plates, ""] });
    }
  };

  const updatePlateInput = (index, value) => {
    const newPlates = [...formData.plates];
    newPlates[index] = value.toUpperCase();
    setFormData({ ...formData, plates: newPlates });
  };

  const selectedSiteData = sites.find(s => s.id === formData.site_id);

  const filteredPlates = plates.filter(plate => {
    const matchesSite = !selectedSite || plate.site_id === selectedSite;
    const matchesSearch = !searchQuery || 
      plate.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plate.plates.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSite && matchesSearch;
  });

  return (
    <div data-testid="plate-management" className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plaka Yönetimi</h1>
          <p className="text-zinc-400 mt-1">Araç plakalarını tanımlayın ve yönetin</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-plate-btn" onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Plaka
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPlate ? "Plaka Düzenle" : "Yeni Plaka Ekle"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site">Site</Label>
                  <Select value={formData.site_id} onValueChange={(value) => setFormData({ ...formData, site_id: value, block_name: "" })} required>
                    <SelectTrigger data-testid="site-select" className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Site seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {sites.map(site => (
                        <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="block">Blok</Label>
                  <Select value={formData.block_name} onValueChange={(value) => setFormData({ ...formData, block_name: value })} disabled={!formData.site_id} required>
                    <SelectTrigger data-testid="block-select" className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Blok seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {selectedSiteData?.blocks.map((block, idx) => (
                        <SelectItem key={idx} value={block.name}>{block.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apartment">Daire No</Label>
                  <Input
                    id="apartment"
                    data-testid="apartment-input"
                    value={formData.apartment_number}
                    onChange={(e) => setFormData({ ...formData, apartment_number: e.target.value })}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="101"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="owner">Adı Soyadı</Label>
                  <Input
                    id="owner"
                    data-testid="owner-input"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="Ahmet Yılmaz"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Araç Plakaları (Max 3)</Label>
                  {formData.plates.length < 3 && (
                    <Button type="button" size="sm" onClick={addPlateInput} data-testid="add-plate-input-btn">
                      <Plus className="h-4 w-4 mr-1" /> Plaka Ekle
                    </Button>
                  )}
                </div>
                {formData.plates.map((plate, idx) => (
                  <Input
                    key={idx}
                    data-testid={`plate-input-${idx}`}
                    value={plate}
                    onChange={(e) => updatePlateInput(idx, e.target.value)}
                    className="bg-zinc-800 border-zinc-700 font-mono"
                    placeholder="34ABC123"
                    maxLength={10}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validUntil">Geçerlilik Tarihi</Label>
                  <Input
                    id="validUntil"
                    data-testid="valid-until-input"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="bg-zinc-800 border-zinc-700"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })} required>
                    <SelectTrigger data-testid="status-select" className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="allowed">İzin Verildi</SelectItem>
                      <SelectItem value="blocked">Yasaklı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" data-testid="submit-plate-btn" className="bg-emerald-600 hover:bg-emerald-700">
                  {editingPlate ? "Güncelle" : "Ekle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-zinc-900 border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filterSite">Site Filtrele</Label>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger data-testid="filter-site-select" className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Tüm siteler" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">Tüm siteler</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="search">Ara</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                id="search"
                data-testid="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-800 border-zinc-700 pl-10"
                placeholder="İsim veya plaka ara..."
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Plates List */}
      <div className="space-y-3">
        {filteredPlates.length === 0 ? (
          <Card className="p-12 bg-zinc-900 border-zinc-800">
            <div className="text-center">
              <Car className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">Kayıt bulunamadı</p>
            </div>
          </Card>
        ) : (
          filteredPlates.map((plate) => (
            <Card key={plate.id} data-testid={`plate-card-${plate.id}`} className="p-4 bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    plate.status === "allowed" ? "bg-green-500/10" : "bg-red-500/10"
                  }`}>
                    <Car className={`h-6 w-6 ${
                      plate.status === "allowed" ? "text-green-400" : "text-red-400"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold">{plate.owner_name}</h3>
                    <p className="text-sm text-zinc-500">
                      {sites.find(s => s.id === plate.site_id)?.name} - {plate.block_name} / {plate.apartment_number}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {plate.plates.map((p, idx) => (
                        <span key={idx} className="px-2 py-1 bg-zinc-800 rounded font-mono text-sm">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">Geçerlilik</p>
                    <p className="text-sm">{new Date(plate.valid_until).toLocaleDateString("tr-TR")}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      plate.status === "allowed" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {plate.status === "allowed" ? "İzinli" : "Yasaklı"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(plate)} data-testid={`edit-plate-${plate.id}`}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(plate.id)} data-testid={`delete-plate-${plate.id}`} className="text-red-400 hover:text-red-300">
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

export default PlateManagement;
