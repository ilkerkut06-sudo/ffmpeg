import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SiteManagement = () => {
  const [sites, setSites] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    blocks: [{ name: "", apartments: 0 }],
  });

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API}/sites`);
      setSites(response.data);
    } catch (error) {
      toast.error("Siteler yüklenemedi");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSite) {
        await axios.put(`${API}/sites/${editingSite.id}`, formData);
        toast.success("Site güncellendi");
      } else {
        await axios.post(`${API}/sites`, formData);
        toast.success("Site eklendi");
      }
      fetchSites();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Siteyi silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/sites/${id}`);
      toast.success("Site silindi");
      fetchSites();
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const handleEdit = (site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      blocks: site.blocks,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSite(null);
    setFormData({
      name: "",
      blocks: [{ name: "", apartments: 0 }],
    });
  };

  const addBlock = () => {
    setFormData({
      ...formData,
      blocks: [...formData.blocks, { name: "", apartments: 0 }],
    });
  };

  const updateBlock = (index, field, value) => {
    const newBlocks = [...formData.blocks];
    newBlocks[index][field] = value;
    setFormData({ ...formData, blocks: newBlocks });
  };

  const removeBlock = (index) => {
    if (formData.blocks.length === 1) return;
    const newBlocks = formData.blocks.filter((_, i) => i !== index);
    setFormData({ ...formData, blocks: newBlocks });
  };

  return (
    <div data-testid="site-management" className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Tanımlama</h1>
          <p className="text-zinc-400 mt-1">Site ve blok bilgilerini yönetin</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-site-btn" onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Site
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSite ? "Site Düzenle" : "Yeni Site Ekle"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Adı</Label>
                <Input
                  id="siteName"
                  data-testid="site-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Bloklar</Label>
                  <Button type="button" size="sm" onClick={addBlock} data-testid="add-block-btn">
                    <Plus className="h-4 w-4 mr-1" /> Blok Ekle
                  </Button>
                </div>

                {formData.blocks.map((block, idx) => (
                  <Card key={idx} className="p-4 bg-zinc-800 border-zinc-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`blockName${idx}`}>Blok Adı</Label>
                        <Input
                          id={`blockName${idx}`}
                          data-testid={`block-name-${idx}`}
                          value={block.name}
                          onChange={(e) => updateBlock(idx, "name", e.target.value)}
                          className="bg-zinc-900 border-zinc-700"
                          placeholder="A Blok"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`apartments${idx}`}>Daire Sayısı</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`apartments${idx}`}
                            data-testid={`apartments-${idx}`}
                            type="number"
                            value={block.apartments}
                            onChange={(e) => updateBlock(idx, "apartments", parseInt(e.target.value))}
                            className="bg-zinc-900 border-zinc-700"
                            min="1"
                            required
                          />
                          {formData.blocks.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeBlock(idx)}
                              data-testid={`remove-block-${idx}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" data-testid="submit-site-btn" className="bg-emerald-600 hover:bg-emerald-700">
                  {editingSite ? "Güncelle" : "Ekle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sites List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.length === 0 ? (
          <Card className="col-span-full p-12 bg-zinc-900 border-zinc-800">
            <div className="text-center">
              <Building2 className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">Henüz site eklenmemiş</p>
              <p className="text-sm text-zinc-600 mt-1">Yeni site eklemek için yukarıdaki butona tıklayın</p>
            </div>
          </Card>
        ) : (
          sites.map((site) => (
            <Card key={site.id} data-testid={`site-card-${site.id}`} className="p-6 bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{site.name}</h3>
                    <p className="text-sm text-zinc-500">{site.blocks.length} Blok</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(site)} data-testid={`edit-site-${site.id}`}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(site.id)} data-testid={`delete-site-${site.id}`} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {site.blocks.map((block, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-2 px-3 bg-zinc-800/50 rounded">
                    <span className="font-medium">{block.name}</span>
                    <span className="text-zinc-500">{block.apartments} Daire</span>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SiteManagement;
