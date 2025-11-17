import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Camera, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
// WebSocket URL'sini oluştururken, backend'deki /api prefix'ini koruyoruz.
// Backend router'ı bu şekilde yapılandırıldığı için bu kullanım doğru.
const WS_URL = BACKEND_URL.replace(/^http/, 'ws');

const CameraBox = ({ camera, position }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("stopped");
  const [isConnecting, setIsConnecting] = useState(false);
  const videoRef = useRef(null);
  const peerConnection = useRef(null);
  const websocket = useRef(null);
  const retryTimeout = useRef(null);

  const stopCameraStream = useCallback(() => {
    // Tüm aktif bağlantıları ve zamanlayıcıları temizle
    clearTimeout(retryTimeout.current);
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (websocket.current) {
      websocket.current.close();
      websocket.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCameraStream = useCallback(async () => {
    if (!camera || isConnecting) return;

    setIsConnecting(true);
    setStatus("connecting");
    stopCameraStream(); // Yeni bir bağlantıdan önce mevcut olanı temizle

    try {
      // 1. Backend'de kameranın aktif olduğundan emin ol
      await axios.post(`${API}/cameras/${camera.id}/start`);

      // 2. WebRTC Peer Connection'ı kur
      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // 3. Gelen video akışını (track) dinle ve video elementine bağla
      peerConnection.current.ontrack = (event) => {
        if (videoRef.current && event.streams && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setStatus("monitoring");
          setIsActive(true);
        }
      };

      // 4. ICE adaylarını backend'e gönder
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate && websocket.current && websocket.current.readyState === WebSocket.OPEN) {
          websocket.current.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
        }
      };

      // 5. Bağlantı durumu değişikliklerini izle ve yeniden bağlanmayı yönet
      peerConnection.current.onconnectionstatechange = () => {
        const state = peerConnection.current?.connectionState;
        if (state === "failed" || state === "disconnected" || state === "closed") {
          setIsActive(false);
          setStatus("stopped");
          // 5 saniye sonra yeniden bağlanmayı dene
          clearTimeout(retryTimeout.current);
          retryTimeout.current = setTimeout(startCameraStream, 5000);
        }
      };

      // 6. Sinyalleşme için WebSocket bağlantısını başlat
      websocket.current = new WebSocket(`${WS_URL}/api/ws/webrtc/${camera.id}`);

      websocket.current.onopen = async () => {
        // Yarış durumunu önlemek için bağlantının hala var olup olmadığını kontrol et
        if (peerConnection.current) {
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          websocket.current.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
        }
      };

      websocket.current.onmessage = async (event) => {
        // Yarış durumunu önlemek için bağlantının hala var olup olmadığını kontrol et
        if (!peerConnection.current) return;

        const message = JSON.parse(event.data);

        if (message.type === 'answer') {
          // *** ANA DÜZELTME: "answer" mesajı doğru formatta set ediliyor ***
          // Backend'den gelen { type: 'answer', sdp: '...' } formatındaki mesaj
          // doğrudan RTCSessionDescription olarak kullanılabilir.
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'ice-candidate' && message.candidate) {
          // Backend'den gelen ICE adayını bağlantıya ekle
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(message.candidate));
          } catch (e) {
            console.error('Alınan ICE adayı eklenirken hata oluştu:', e);
          }
        }
      };

      websocket.current.onerror = (error) => {
        console.error("WebSocket hatası:", error);
        setStatus("error");
        setIsActive(false);
      };

    } catch (error) {
      toast.error(`${camera.name} başlatılamadı`);
      setStatus("error");
      setIsActive(false);
    } finally {
      setIsConnecting(false);
    }
  }, [camera, isConnecting, stopCameraStream]);


  const stopCamera = async () => {
    try {
      // Backend'e kamerayı durdurma isteği gönder
      await axios.post(`${API}/cameras/${camera.id}/stop`);
      stopCameraStream();
      setIsActive(false);
      setStatus("stopped");
      toast.info(`${camera.name} durduruldu`);
    } catch (error) {
      toast.error(`${camera.name} durdurulamadı`);
    }
  };

  // Bileşen yüklendiğinde veya kamera değiştiğinde akışı başlat
  useEffect(() => {
    if (camera) {
      startCameraStream();
    }
    // Bileşen kaldırıldığında tüm bağlantıları temizle
    return () => {
      stopCameraStream();
    };
  }, [camera, startCameraStream, stopCameraStream]);

  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCameraStream();
    }
  };

  const statusColors = {
    monitoring: "border-zinc-700",
    allowed: "border-green-500 status-allowed",
    blocked: "border-red-500 status-blocked",
    unknown: "border-yellow-500 status-unknown",
    stopped: "border-zinc-800",
    connecting: "border-blue-500",
    error: "border-red-700",
  };

  return (
    <Card
      data-testid={`camera-box-${position}`}
      className={`camera-box bg-zinc-900 border-2 ${statusColors[status]} transition-all duration-300 overflow-hidden`}
    >
      <div className="aspect-video bg-zinc-950 relative flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isActive ? "block" : "hidden"}`}
        />

        {!isActive && (
          <div className="flex flex-col items-center gap-3 text-zinc-600">
             {status === "connecting" && <RefreshCw className="h-12 w-12 animate-spin" />}
             {status === "stopped" && <Camera className="h-12 w-12" />}
             {status === "error" && <Camera className="h-12 w-12" />}
             <p className="text-sm">
                {status === 'connecting' && 'Bağlanıyor...'}
                {status === 'stopped' && 'Durduruldu'}
                {status === 'error' && 'Hata'}
             </p>
          </div>
        )}

        {isActive && (
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-500 pulse" />
            <span className="text-xs font-medium">CANLI</span>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleCamera}
            className="bg-black/60 backdrop-blur-sm hover:bg-black/80"
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>

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
