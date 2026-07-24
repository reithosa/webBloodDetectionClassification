// Функция уведомления
function notify(title, text, type = 'info') {
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#c8f060" stroke-width="1.2"/>
                <path d="M5 8l2.5 2.5L11 5.5" stroke="#c8f060" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#ff4757" stroke-width="1.2"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke="#ff4757" stroke-width="1.4" stroke-linecap="round"/>
              </svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#4da6ff" stroke-width="1.2"/>
                <path d="M8 7v4M8 5.5v.5" stroke="#4da6ff" stroke-width="1.4" stroke-linecap="round"/>
              </svg>`
  };

  const n = document.createElement('div');
  n.className = `notif ${type}`;
  n.innerHTML = `
    <div class="notif-icon">${icons[type]}</div>
    <div class="notif-text">
      <div class="notif-title">${title}</div>
      ${text}
    </div>`;

  document.getElementById('notifications').prepend(n);

  setTimeout(() => {
    n.style.opacity = '0';
    n.style.transform = 'translateX(10px)';
    setTimeout(() => n.remove(), 300);
  }, 4000);
}

// Обработка изображения
const fileInput        = document.getElementById('fileInput');
const uploadZone       = document.getElementById('uploadZone');
const previewArea      = document.getElementById('previewArea');
const previewImg       = document.getElementById('previewImg');
const previewFilename  = document.getElementById('previewFilename');
const fileMeta         = document.getElementById('fileMeta');
const clearBtn         = document.getElementById('clearBtn');
const submitBtn        = document.getElementById('submitBtn');
const submitNote       = document.getElementById('submitNote');
const analyzingOverlay = document.getElementById('analyzingOverlay');

let currentFile = null;

function formatSize(bytes) {
  if (bytes < 1024)     return bytes + ' B';
  if (bytes < 1048576)  return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

function handleFile(file) {
  if (!file) return;

  const allowed = ['image/jpeg', 'image/png'];
  if (!allowed.includes(file.type)) {
    notify('Неверный формат', 'Допустимы только JPG, JPEG, PNG', 'error');
    return;
  }
  if (file.size > 32 * 1024 * 1024) {
    notify('Файл слишком большой', 'Максимальный размер: 32 МБ', 'error');
    return;
  }

  currentFile = file;
  const reader = new FileReader();

  reader.onload = (e) => {
    previewImg.src = e.target.result;

    const img = new Image();
    img.onload = () => {
      fileMeta.innerHTML = `
        <div class="spec-item">
          <span class="spec-key">Имя файла</span>
          <span class="spec-val" style="font-size:9px">${file.name}</span>
        </div>
        <div class="spec-item">
          <span class="spec-key">Тип</span>
          <span class="spec-val">${file.type.split('/')[1].toUpperCase()}</span>
        </div>
        <div class="spec-item">
          <span class="spec-key">Размер</span>
          <span class="spec-val highlight">${formatSize(file.size)}</span>
        </div>
        <div class="spec-item">
          <span class="spec-key">Разрешение</span>
          <span class="spec-val">${img.naturalWidth}×${img.naturalHeight}</span>
        </div>
        <div class="spec-item">
          <span class="spec-key">Статус</span>
          <span class="spec-val highlight">Готов</span>
        </div>
        <div class="spec-item">
          <span class="spec-key">Точность (%)</span>
          <input type="number" min="10" max="100" step="10" value="60" id="confidence" class="spec-val input_number"/>
        </div>`;
    };
    img.src = e.target.result;

    previewFilename.textContent = file.name;
    previewArea.classList.add('visible');
    submitBtn.disabled = false;
    submitNote.textContent = `// ${file.name} готов к анализу`;
    notify('Файл загружен', `${file.name} (${formatSize(file.size)})`, 'success');
  };

  reader.readAsDataURL(file);
}

// кнопка input file
fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

// drag and drop
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// очистка
clearBtn.addEventListener('click', () => {
  currentFile = null;
  fileInput.value = '';
  previewArea.classList.remove('visible');
  previewImg.src = '';
  submitBtn.disabled = true;
  submitNote.textContent = '// Файл не выбран';
});

// отправка
submitBtn.addEventListener('click', () => {
  if (!currentFile) return;
  notify('Изображение отправлено', '', 'info');
  analyzingOverlay.classList.add('active');
  submitBtn.disabled = true;
  submitNote.textContent = '// Анализ выполняется...';

  let dots = 0;
  const textEl = analyzingOverlay.querySelector('.analyzing-text');
  const dotInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    textEl.textContent = 'Обработка изображения' + '.'.repeat(dots);
  }, 500);

  let input = document.querySelector('#fileInput');
  let data = new FormData();
  data.append('image', input.files[0]);

  const numberInput = document.getElementById('confidence');
  let confidence = 0;
  if (numberInput.value) {
    confidence = Number(numberInput.value);
  } else {
    confidence = 60;
  };
  confidence = confidence / 100;

  data.append('confidence', confidence);
  
  fetch('/image', {
      method: 'POST',
      body: data
  }) 
  .then(response => {
      return response.json()
  })
  .then(responseData => {
    clearInterval(dotInterval);
    analyzingOverlay.classList.remove('active');
    submitBtn.disabled = false;
    submitNote.textContent = '// Анализ завершён успешно';
    if (responseData.status === true){
        let file_name = responseData.file_name;
        notify('Анализ завершён', `Результаты доступны в разделе «Изображения». Новое имя изображения - ${file_name}!`, 'success');
        console.log(`Status: ${responseData.status}, file_name: ${file_name}`);
        setTimeout(() => {
          window.location.href = `/image/${file_name}`;
        }, 2000);
    } else {
      notify('Изображение не загружено', 'Ошибка на стороне сервера. Обратитесь в техническую поддержку.', 'error');
    };
  })
  .catch(error => {
      console.log("Error: ", error);
  })
  .finally(() => { 
    clearInterval(dotInterval);
    analyzingOverlay.classList.remove('active');
    previewArea.classList.remove('visible');
    submitBtn.disabled = false;
    submitNote.textContent = '// Анализ завершён успешно';
  });
  console.log("Файл отправлен");
});

// NAV кнопки
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

const images_Button = document.getElementById("images-Template");
images_Button.addEventListener('click', () => {
  window.location.href = '/images';
});

const main_menu_Button = document.getElementById("main-menu-Template");
main_menu_Button.addEventListener('click', () => {
  window.location.href = '/';
});

const logo_Button = document.getElementById('logo-Button');
logo_Button.addEventListener('click', () => {
    window.location.href = '/';
});