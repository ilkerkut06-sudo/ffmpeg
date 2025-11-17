# Plaka Tanıma Sistemi

**Evo Teknoloji Plaka Tanıma Sistemi** - YOLOv8 ve Tesseract OCR kullanarak gerçek zamanlı Türk plaka tanıma sistemi.

## 🚀 Özellikler

### Ana Ekran
- 4 kameraya kadar canlı izleme (2x2 grid)
- Gerçek zamanlı plaka tespiti
- Otomatik kapı kontrolü
- Günlük istatistikler
- Son 20 tespit kaydı
- CPU/RAM kullanım göstergesi

### Yönetim Modülleri
- **Site Tanımlama**: Site, blok ve daire yönetimi
- **Plaka Yönetimi**: Araç plakası kayıt sistemi (daire başına 3 araç)
- **Kamera Yönetimi**: Webcam, RTSP, HTTP kamera desteği
- **Kapı Yönetimi**: NodeMCU kontrollü kapı entegrasyonu
- **Raporlar**: Tarih ve durum bazlı filtreleme

### Teknik Özellikler
- YOLOv8 araç tespiti
- Tesseract OCR Türkçe plaka okuma
- CPU/GPU otomatik geçiş
- WebSocket ile canlı güncellemeler
- MongoDB veritabanı
- Modern React arayüz

## 📋 Gereksinimler

- **Python** 3.9+
- **Node.js** 18+
- **MongoDB** 6.0+
- **Tesseract OCR** 5.0+
- **Windows** 10/11 (önerilen)

## ⚡ Hızlı Başlangıç

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd plaka-okuma-sistemi
```

### 2. Kurulum (Otomatik)
```bash
# Windows'ta:
install.bat

# Manuel kurulum için README_KURULUM.md dosyasına bakın
```

### 3. Sistemi Başlatın
```bash
# Windows'ta:
start.bat

# Tarayıcınızda otomatik açılacak:
# http://localhost:3000
```

## 📖 Detaylı Kurulum

Detaylı kurulum ve yapılandırma için [README_KURULUM.md](README_KURULUM.md) dosyasına bakın.

## 🎯 Kullanım

1. **MongoDB'yi başlatın**
   ```bash
   net start MongoDB
   ```

2. **Sistemi başlatın**
   - `start.bat` dosyasına çift tıklayın

3. **Yapılandırma**
   - Site/Blok/Daire tanımlaması yapın
   - Kapı kontrolcülerinizi ekleyin
   - Kameraları ekleyin ve yapılandırın
   - Araç plakalarını kaydedin

4. **Canlı İzleme**
   - Ana ekrandan kameraları başlatın
   - Gerçek zamanlı plaka tespiti izleyin
   - Otomatik kapı kontrolü çalışacak

## 🔧 Ayarlar

### Plaka Tanıma Motoru
- **YOLOv8 + Tesseract**: Ücretsiz, offline
- **YOLOv8 + OpenALPR**: Daha hızlı (lisans gerekebilir)

### İşlem Modu
- **Auto**: GPU varsa kullanır
- **CPU**: Sadece işlemci
- **GPU**: NVIDIA CUDA gerekir

### Kamera Ayarları
- **FPS**: 5-30 (önerilen: 15)
- **Boyut**: Küçük/Orta/Büyük
- **Tip**: Webcam (0,1,2) / RTSP / HTTP

## 📊 Sistem Gereksinimleri

### Minimum
- CPU: Intel Core i5 / AMD Ryzen 5
- RAM: 8 GB
- Disk: 5 GB boş alan

### Önerilen
- CPU: Intel Core i7 / AMD Ryzen 7
- RAM: 16 GB
- GPU: NVIDIA GTX 1060 veya üzeri (CUDA)
- Disk: 10 GB SSD

## 🐛 Sorun Giderme

### MongoDB Bağlanamıyor
```bash
net start MongoDB
# veya
mongod --dbpath C:\data\db
```

### Tesseract Bulunamıyor
```bash
# PATH'e ekleyin:
set PATH=%PATH%;C:\Program Files\Tesseract-OCR
```

### Kamera Bağlanamıyor
- Webcam: URL = `0` (ilk kamera)
- RTSP: `rtsp://192.168.1.100:554/stream`
- Kameranın başka program tarafından kullanılmadığından emin olun

### GPU Kullanımı
```bash
# PyTorch CUDA sürümünü kurun:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## 📁 Proje Yapısı

```
plaka-okuma-sistemi/
├── backend/              # FastAPI Backend
│   ├── server.py        # Ana sunucu
│   ├── requirements.txt # Python bağımlılıkları
│   └── .env            # Ortam değişkenleri
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── pages/      # Sayfa bileşenleri
│   │   └── components/ # UI bileşenleri
│   ├── package.json    # Node.js bağımlılıkları
│   └── .env           # Ortam değişkenleri
├── install.bat         # Otomatik kurulum scripti
├── start.bat          # Başlatma scripti
└── stop.bat           # Durdurma scripti
```

## 🤝 Destek

- GitHub Issues
- Email: support@example.com

## 📚 Dökümantasyon

- [Kurulum Rehberi](README_KURULUM.md)
- API Dökümantasyonu: http://localhost:8001/docs

## 🎉 Teşekkürler

Bu proje aşağıdaki açık kaynak projeleri kullanmaktadır:
- [YOLOv8](https://github.com/ultralytics/ultralytics)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
