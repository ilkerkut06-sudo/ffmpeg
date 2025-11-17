import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const RecentDetections = ({ detections }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "allowed":
        return "border-green-500/50 bg-green-500/5";
      case "blocked":
        return "border-red-500/50 bg-red-500/5";
      case "unknown":
        return "border-yellow-500/50 bg-yellow-500/5";
      default:
        return "border-zinc-800";
    }
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card data-testid="recent-detections" className="bg-zinc-900 border-zinc-800 p-4 h-full">
      <h2 className="text-lg font-bold mb-3">Son Tespitler</h2>
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {detections.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">Henüz tespit yok</p>
          ) : (
            detections.slice(0, 20).map((detection, idx) => (
              <Card
                key={detection.id || idx}
                data-testid={`recent-detection-${idx}`}
                className={`p-3 border ${getStatusColor(detection.status)} transition-all duration-300`}
              >
                <div className="flex items-start gap-3">
                  {detection.image_base64 && (
                    <img
                      src={`data:image/jpeg;base64,${detection.image_base64}`}
                      alt="Detection"
                      className="w-20 h-16 object-cover rounded border border-zinc-700"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(detection.status)}
                      <span className="font-mono font-bold text-sm">{detection.plate}</span>
                    </div>
                    {detection.owner_info && (
                      <div className="text-xs text-zinc-400 space-y-1">
                        <p>{detection.owner_info.owner_name}</p>
                        <p>{detection.owner_info.apartment}</p>
                      </div>
                    )}
                    {!detection.owner_info && (
                      <p className="text-xs text-zinc-500">Misafir / Tanımsız</p>
                    )}
                    <p className="text-xs text-zinc-600 mt-1">{formatTime(detection.timestamp)}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default RecentDetections;
