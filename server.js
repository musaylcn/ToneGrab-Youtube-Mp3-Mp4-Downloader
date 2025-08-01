const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;


const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Downloads klasörünü oluştur
const downloadsDir = path.join(__dirname, 'downloads');
fs.ensureDirSync(downloadsDir);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'a.html'));
});

// Tek bir convert endpoint'i
app.post('/api/convert', async (req, res) => {
  try {
    const { url, format, socketId } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL parametresi gerekli' });
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return res.status(400).json({ error: 'Geçersiz YouTube URL\'si' });
    }


    res.json({
      success: true,
      message: 'Dönüştürme başlatıldı',
      socketId: socketId
    });


    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true
    });


    if (socketId) {
      io.to(socketId).emit('progress', { percent: 10, status: 'İşleniyor' });
    }

    const videoTitle = info.title.replace(/[^\w\s]/gi, '');
    const fileName = `${videoTitle}.${format}`;
    const filePath = path.join(downloadsDir, fileName);


    const ytdlpPath = youtubedl.path || 'yt-dlp';
    let args = [
      url,
      '--output', filePath,
      '--no-check-certificates',
      '--no-warnings',
      '--prefer-free-formats',
      '--newline'
    ];

    if (format === 'mp3') {
      args.push('--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0');
    } else if (format === 'mp4') {
      args.push('--format', 'best[ext=mp4]/best');
    }

    const proc = spawn(ytdlpPath, args);

    if (socketId) {
      io.to(socketId).emit('progress', { percent: 20, status: 'İşleniyor' });
    }

   
    await new Promise((resolve, reject) => {
      let lastProgress = 20;

      proc.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('[download]')) {
          // Progress bilgisini parse et
          const match = output.match(/(\d+\.?\d*)%/);
          if (match) {
            const percent = Math.min(parseFloat(match[1]), 95);
            if (percent > lastProgress) {
              lastProgress = percent;
              if (socketId) {
                io.to(socketId).emit('progress', {
                  percent: percent,
                  status: 'İşleniyor'
                });
              }
            }
          }
        }
      });

      proc.on('close', (code) => {
        if (code === 0) {
          if (socketId) {
            io.to(socketId).emit('progress', { percent: 100, status: 'Tamamlandı' });
            io.to(socketId).emit('complete', {
              success: true,
              title: info.title,
              thumbnail: info.thumbnail,
              downloadUrl: `/download/${encodeURIComponent(fileName)}`,
              fileName
            });
          }
          resolve();
        } else {
          if (socketId) {
            io.to(socketId).emit('error', { error: `yt-dlp exited with code ${code}` });
          }
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
      });

      proc.on('error', (err) => {
        if (socketId) {
          io.to(socketId).emit('error', { error: err.message });
        }
        reject(err);
      });
    });

  } catch (error) {
    console.error('Convert error:', error);
    if (req.body.socketId) {
      io.to(req.body.socketId).emit('error', {
        error: 'Dönüştürme başarısız oldu',
        details: error.message
      });
    }
  }
});

// İndirme endpoint'i
app.get('/download/:filename', (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const filePath = path.join(downloadsDir, filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath, filename);
  } else {
    res.status(404).json({ error: 'Dosya bulunamadı' });
  }
});


setInterval(() => {
  fs.readdir(downloadsDir, (err, files) => {
    if (err) return;
    files.forEach(file => {
      const filePath = path.join(downloadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        const hoursDiff = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 24) {
          fs.unlink(filePath, err => {
            if (err) console.error('Dosya silinemedi:', err);
          });
        }
      });
    });
  });
}, 60 * 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`http://localhost:${PORT} adresinden erişebilirsiniz`);
});