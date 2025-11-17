import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const DetectionLog = ({ detections }) => {
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
    return new Date(timestamp).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card data-testid="detection-log" className="bg-zinc-900 border-zinc-800 p-4">
      <h2 className="text-lg font-bold mb-3">Tespit Logları</h2>
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {detections.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Henüz tespit yok</p>
          ) : (
            detections.map((detection, idx) => (
              <div
                key={detection.id || idx}
                data-testid={`log-entry-${idx}`}
                className="flex items-center gap-3 text-sm py-2 px-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                {getStatusIcon(detection.status)}
                <span className="font-mono font-semibold">{detection.plate}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">
                  {detection.owner_info?.owner_name || "Misafir"}
                </span>
                <span className="ml-auto text-xs text-zinc-500">
                  {formatTime(detection.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default DetectionLog;
