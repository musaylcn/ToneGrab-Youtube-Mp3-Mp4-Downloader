# 🎧 ToneGrab - YouTube MP3/MP4 İndirici

YouTube videolarını MP3 veya MP4 formatında indirmek için kullanılan modern web uygulaması.

## ✨ Özellikler

- 🎵 YouTube videolarını MP3 formatında indirme
- 🎬 YouTube videolarını MP4 formatında indirme
- 🎨 Modern ve kullanıcı dostu arayüz
- ⚡ Hızlı dönüştürme işlemi
- 🔒 Güvenli ve ücretsiz
- 📱 Mobil uyumlu tasarım

## 🚀 Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Uygulamayı başlatın:**
   ```bash
   npm start
   ```

3. **Geliştirme modunda çalıştırın:**
   ```bash
   npm run dev
   ```

4. **Tarayıcınızda açın:**
   ```
   http://localhost:3000
   ```

## 📖 Kullanım

1. YouTube video URL'sini girin
2. MP3 veya MP4 formatını seçin
3. "Dönüştür ve İndir" butonuna tıklayın
4. İndirme başlayacaktır

## 🛠️ Teknolojiler

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **YouTube API:** youtube-dl-exec
- **Dosya İşlemleri:** fs-extra

## 📁 Proje Yapısı

```
youtube-downloader/
├── a.html          # Ana HTML sayfası
├── app.js          # Frontend JavaScript
├── server.js       # Backend server
├── package.json    # Proje bağımlılıkları
├── README.md       # Bu dosya
└── downloads/      # İndirilen dosyalar (otomatik oluşur)
```

## 🔧 API Endpoints

- `GET /` - Ana sayfa
- `GET /api/info?url=<youtube_url>` - Video bilgilerini al
- `GET /api/convert?url=<youtube_url>&format=<mp3|mp4>` - Dönüştürme işlemi
- `GET /download/<filename>` - Dosya indirme

## ⚠️ Yasal Uyarı

Bu uygulama sadece eğitim amaçlıdır. Telif hakkı olan içerikleri indirirken yasal düzenlemelere uygun hareket edin.

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🆘 Sorun Giderme

### Yaygın Sorunlar

1. **"Video bilgisi alınamadı" hatası:**
   - YouTube URL'sinin geçerli olduğundan emin olun
   - Video'nun erişilebilir olduğunu kontrol edin
   - İnternet bağlantınızı kontrol edin

2. **"Dönüştürme başarısız" hatası:**
   - İnternet bağlantınızı kontrol edin
   - Video'nun telif hakkı koruması olmadığından emin olun
   - YouTube-dl güncellemelerini kontrol edin

3. **Port hatası:**
   - 3000 portunun kullanılabilir olduğundan emin olun
   - Farklı bir port kullanmak için: `PORT=3001 npm start`

4. **youtube-dl-exec hatası:**
   - Sistem PATH'inizde youtube-dl veya yt-dlp olduğundan emin olun
   - Gerekirse manuel olarak yükleyin: https://github.com/yt-dlp/yt-dlp

## 📞 İletişim

Sorularınız için issue açabilir veya pull request gönderebilirsiniz. 