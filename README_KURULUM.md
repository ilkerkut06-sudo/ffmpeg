# Plaka Tanıma Sistemi - Kurulum Rehberi

## Windows'ta Kurulum

### Gereksinimler
- Windows 10/11
- Python 3.9 veya üzeri
- Node.js 18 veya üzeri
- MongoDB 6.0 veya üzeri
- Git (opsiyonel)

### Hızlı Kurulum (Otomatik)

1. **Projeyi İndirin**
   - GitHub'dan zip olarak indirin veya:
   ```bash
   git clone <repository-url>
   cd plaka-okuma-sistemi
   ```

2. **Otomatik Kurulum**
   - `install.bat` dosyasına çift tıklayın
   - Script otomatik olarak tüm bağımlılıkları kuracak
   - MongoDB kurulu değilse indirme linki verecek

3. **Sistemi Başlatın**
   - `start.bat` dosyasına çift tıklayın
   - Tarayıcınızda http://localhost:3000 açılacak

### Manuel Kurulum

#### 1. MongoDB Kurulumu
```bash
# MongoDB Community Edition indirin:
# https://www.mongodb.com/try/download/community

# Kurulumdan sonra MongoDB'yi başlatın:
net start MongoDB
```

#### 2. Python Bağımlılıkları
```bash
cd backend
pip install -r requirements.txt
```

#### 3. Tesseract OCR Kurulumu
```bash
# Tesseract OCR indirin:
# https://github.com/UB-Mannheim/tesseract/wiki
# Kurulum sırasında "Turkish" dil paketini seçin

# PATH'e ekleyin (örnek):
# C:\Program Files\Tesseract-OCR
```

#### 4. Node.js Bağımlılıkları
```bash
cd frontend
npm install
# veya
yarn install
```

#### 5. Ortam Değişkenlerini Ayarlayın

**backend/.env**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=plaka_tanima_db
CORS_ORIGINS=http://localhost:3000
```

**frontend/.env**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

#### 6. Sistemi Başlatın

**Terminal 1 - Backend:**
```bash
cd backend
python server.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Kullanım

1. Tarayıcıda http://localhost:3000 açın
2. **Kamera Yönetimi** → Yeni kamera ekleyin
3. **Kapı Yönetimi** → NodeMCU cihazlarınızı tanımlayın
4. **Site Tanımlama** → Site/blok/daire yapınızı oluşturun
5. **Plaka Yönetimi** → Araç plakalarını kaydedin
6. **Ana Ekran** → Kameraları başlatın ve canlı izleme yapın

### Sorun Giderme

**MongoDB bağlanamıyor:**
```bash
# MongoDB servisini kontrol edin:
net start MongoDB

# Veya manuel başlatın:
mongod --dbpath C:\data\db
```

**Backend başlamıyor:**
```bash
# Python sürümünü kontrol edin:
python --version  # 3.9+ olmalı

# Bağımlılıkları yeniden kurun:
pip install -r requirements.txt
```

**Tesseract bulunamıyor:**
```bash
# PATH'e ekleyin:
set PATH=%PATH%;C:\Program Files\Tesseract-OCR

# Test edin:
tesseract --version
```

**Kamera bağlanamıyor:**
- Webcam için: URL = 0 (ilk kamera)
- RTSP için: rtsp://192.168.1.100:554/stream
- URL'nin doğru olduğundan emin olun
- Kamera başka program tarafından kullanılmıyor olmalı

### Performans İpuçları

**GPU Kullanımı (NVIDIA):**
```bash
# PyTorch CUDA sürümünü kurun:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Ayarlar → İşlem Modu → GPU seçin
```

**FPS Ayarı:**
- Yüksek FPS (25-30): Daha hassas tespit, yüksek CPU kullanımı
- Düşük FPS (10-15): Daha az CPU kullanımı, yeterli tespit

**Çoklu Kamera:**
- Her kamera ayrı thread'de çalışır
- 4 kameradan fazla eklemek sistem performansını etkileyebilir

### Destek

Sorularınız için:
- GitHub Issues
- Email: support@example.com

### Lisans

MIT License
