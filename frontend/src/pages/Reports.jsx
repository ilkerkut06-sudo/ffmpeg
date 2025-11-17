import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Reports = () => {
  const [detections, setDetections] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchDetections();
    }
  }, [startDate, endDate, filterStatus]);

  const fetchDetections = async () => {
    setLoading(true);
    try {
      let url = `${API}/detections?start_date=${startDate}&end_date=${endDate}`;
      if (filterStatus !== "all") {
        url += `&status=${filterStatus}`;
      }
      const response = await axios.get(url);
      setDetections(response.data);
    } catch (error) {
      toast.error("Raporlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    // In a real implementation, this would use a library like jsPDF
    toast.info("PDF özelliği yakında eklenecek");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "allowed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "blocked":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "unknown":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      allowed: "bg-green-500/20 text-green-400",
      blocked: "bg-red-500/20 text-red-400",
      unknown: "bg-yellow-500/20 text-yellow-400",
    };
    const labels = {
      allowed: "İzinli",
      blocked: "Yasaklı",
      unknown: "Misafir",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const stats = {
    total: detections.length,
    allowed: detections.filter(d => d.status === "allowed").length,
    blocked: detections.filter(d => d.status === "blocked").length,
    unknown: detections.filter(d => d.status === "unknown").length,
  };

  return (
    <div data-testid="reports" className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Raporlar</h1>
          <p className="text-zinc-400 mt-1">Tespit geçmişini görüntüleyin ve dışa aktarın</p>
        </div>
        <Button data-testid="export-pdf-btn" onClick={exportToPDF} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="h-4 w-4 mr-2" />
          PDF İndir
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="startDate">Başlangıç Tarihi</Label>
            <Input
              id="startDate"
              data-testid="start-date-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div>
            <Label htmlFor="endDate">Bitiş Tarihi</Label>
            <Input
              id="endDate"
              data-testid="end-date-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div>
            <Label htmlFor="filterStatus">Durum Filtresi</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-testid="filter-status-select" className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="allowed">İzinli</SelectItem>
                <SelectItem value="blocked">Yasaklı</SelectItem>
                <SelectItem value="unknown">Misafir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button data-testid="apply-filter-btn" onClick={fetchDetections} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? "Yükleniyor..." : "Filtrele"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-zinc-400">Toplam</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-zinc-400">İzinli</p>
              <p className="text-2xl font-bold text-green-400">{stats.allowed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-sm text-zinc-400">Misafir</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.unknown}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-sm text-zinc-400">Yasaklı</p>
              <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detections Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold">Tespit Kayıtları</h2>
          <p className="text-sm text-zinc-500">{detections.length} kayıt bulundu</p>
        </div>
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-2">
            {detections.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">Seçili tarih aralığında kayıt bulunamadı</p>
              </div>
            ) : (
              detections.map((detection, idx) => (
                <Card
                  key={detection.id || idx}
                  data-testid={`report-item-${idx}`}
                  className="p-4 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {detection.image_base64 && (
                        <img
                          src={`data:image/jpeg;base64,${detection.image_base64}`}
                          alt="Detection"
                          className="w-24 h-16 object-cover rounded border border-zinc-700"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(detection.status)}
                          <span className="font-mono font-bold">{detection.plate}</span>
                          {getStatusBadge(detection.status)}
                        </div>
                        {detection.owner_info ? (
                          <div className="text-sm text-zinc-400">
                            <p>{detection.owner_info.owner_name}</p>
                            <p className="text-xs text-zinc-500">{detection.owner_info.apartment}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-500">Misafir / Tanımsız</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDateTime(detection.timestamp)}</p>
                      <p className="text-xs text-zinc-500">Güven: {(detection.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Reports;
