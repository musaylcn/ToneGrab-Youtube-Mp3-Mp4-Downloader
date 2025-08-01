document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('converter');
  const urlInput = document.getElementById('url');
  const formatButtons = document.getElementById('formatButtons');
  const convertBtn = document.getElementById('convertBtn');
  const result = document.getElementById('result');
  const downloadBtn = document.getElementById('downloadBtn');
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');
  const videoThumb = document.getElementById('videoThumb');
  const videoTitle = document.getElementById('videoTitle');
  const refreshBtn = document.getElementById('refreshBtn');

  const progressContainer = document.getElementById('progressContainer');
  const progressPercent = document.getElementById('progressPercent');
  const progressStatus = document.getElementById('progressStatus');
  const progressCircle = document.querySelector('.progress-circle');
  const progressRing = document.querySelector('.progress-ring-circle');

  const socket = io();
  let socketId = null;

  socket.on('connect', () => {
    socketId = socket.id;
    console.log('Socket.IO bağlandı:', socketId);
  });

  socket.on('progress', (data) => {
    updateProgress(data.percent, data.status);
  });

  socket.on('complete', (data) => {
    setTimeout(() => {
      hideProgress();
      videoThumb.src = data.thumbnail;
      videoTitle.textContent = data.title;
      result.classList.remove('hidden');
      downloadBtn.href = data.downloadUrl;
      downloadBtn.download = data.fileName;
      showSuccess(`${selectedFormat.toUpperCase()} dosyası hazır!`);
      convertBtn.disabled = false;
    }, 1000);
  });

  socket.on('error', (data) => {
    hideProgress();
    showError(data.error || 'Bir hata oluştu');
    convertBtn.disabled = false;
  });

  let selectedFormat = null;
  let videoInfo = null;

  function showProgress() {
    progressContainer.classList.remove('hidden');
    result.classList.add('hidden');
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
  }

  function hideProgress() {
    progressContainer.classList.add('hidden');
  }

  function updateProgress(percent, status) {
    progressPercent.textContent = `${Math.round(percent)}%`;
    progressStatus.textContent = status;


    const circumference = 2 * Math.PI * 54; // r=54
    const offset = circumference - (percent / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;

    if (percent > 0 && percent < 100) {
      progressCircle.classList.add('animate');
    } else {
      progressCircle.classList.remove('animate');
    }
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    successDiv.classList.add('hidden');
    result.classList.add('hidden');
  }

  function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
  }

  function clearMessages() {
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    result.classList.add('hidden');
  }

  function isValidYouTubeURL(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;
    return youtubeRegex.test(url);
  }


  urlInput.addEventListener('input', function () {
    const url = this.value.trim();
    clearMessages();

    if (url && isValidYouTubeURL(url)) {

      formatButtons.classList.add('show');
      convertBtn.textContent = 'Video Bilgilerini Al';
    } else {
      formatButtons.classList.remove('show');
      convertBtn.textContent = 'Dönüştür ve İndir';
      selectedFormat = null;
    }
  });


  formatButtons.addEventListener('click', function (e) {
    if (e.target.classList.contains('format-btn')) {

      document.querySelectorAll('.format-btn').forEach(btn => {
        btn.classList.remove('selected');
      });

      // Yeni seçimi işaretle
      e.target.classList.add('selected');
      selectedFormat = e.target.dataset.format;
      convertBtn.textContent = `${selectedFormat.toUpperCase()} Olarak Dönüştür`;
    }
  });


  refreshBtn.addEventListener('click', function () {
    urlInput.value = '';


    selectedFormat = null;
    document.querySelectorAll('.format-btn').forEach(btn => {
      btn.classList.remove('selected');
    });


    formatButtons.classList.remove('show');


    convertBtn.textContent = 'Dönüştür ve İndir';


    clearMessages();


    hideProgress();
  });


  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const url = urlInput.value.trim();
    if (!url) {
      showError('Bir URL girin');
      return;
    }

    if (!selectedFormat) {
      showError('Lütfen bir format seçin (MP3 veya MP4)');
      return;
    }

    try {
      clearMessages();
      result.classList.add('hidden');
      convertBtn.disabled = true;


      showProgress();
      updateProgress(0, 'Başlatılıyor');

      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: urlInput.value.trim(),
          format: selectedFormat,
          socketId: socketId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Dönüştürme başarısız');
      }

      if (data.success) {

        updateProgress(5, 'İşleniyor');
      } else {
        throw new Error('Dönüştürme başarısız');
      }
    } catch (error) {
      hideProgress();
      showError(error.message || 'Bir hata oluştu, lütfen tekrar deneyin.');
      convertBtn.disabled = false;
    }
  });
});