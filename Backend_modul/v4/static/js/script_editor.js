"use strict";

// Уведомление
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

// Сохранение
const submitNote = document.getElementById('submitNote');
const submitBtn  = document.getElementById('submitBtn');
const analyzingOverlay = document.getElementById('analyzingOverlay');
submitBtn.disabled = false;

submitBtn.addEventListener('click', () => {
  analyzingOverlay.classList.add('active');
  submitBtn.disabled = true;
  submitNote.textContent = '// Загрузка изображения...';

  let dots = 0;
  const textEl = analyzingOverlay.querySelector('.analyzing-text');
  const dotInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    textEl.textContent = 'Загрузка изображения' + '.'.repeat(dots);
  }, 500);

  setTimeout(() => {
    clearInterval(dotInterval);
    analyzingOverlay.classList.remove('active');
    submitBtn.disabled = false;
    submitNote.textContent = '// Загрузка завершена успешно';
    notify('Загрузка завершена', 'Результаты доступны в разделе «Изображения»', 'success');
  }, 3500);
});

// Nav 
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});



//Используемые переменные
let tool = "cursor";
let isDraggible = false;
const scaleFactor = 1.2; 
let olderPosition = {x: 0, y: 0};
let newPosition = {x: 0, y: 0};
let shift = {x: 0, y: 0};
let scale = 1;
let imageBox = null;
let color = "#e05252";
let counts = 1;
let isClick = false;

// Konva Canvas
const canvas_div = document.getElementById('uploadZone');
const stage = new Konva.Stage({
    container: canvas_div,
    width: canvas_div.offsetWidth,
    height: canvas_div.offsetHeight
});
const bloodLayer = new Konva.Layer();
stage.add(bloodLayer);
dragOn();

const classes = new Map([
    ['#a78bfa', 'Базофил'],
    ['#c8f060', 'Эозинофил'],
    ['#e05252', 'Эритроцит'],
    ['#34d399', 'Лимфоцит'],
    ['#f472b6', 'Моноцит'],
    ['#4da6ff', 'Нейтрофил'],
    ['#e8a94d', 'Тромбоцит'],
]);

//aside параметры bbox
const x_title = document.getElementById('x-box');
const y_title = document.getElementById('y-box');
const w_title = document.getElementById('width-box');
const h_title = document.getElementById('height-box');
const conf_title = document.getElementById('conf-box');
const cls_title = document.getElementById('class-box');
const deleteBtn = document.getElementById('deleteBtn');

deleteBtn.addEventListener("click", () => {
    if(transformer.nodes().length !== 0) {
        const rects = transformer.nodes();
        rects.forEach(rect => {
            console.log(`Deleting ${rect.name()}`);
            rect.destroy();
        });
        transformer.nodes([]);
        notselected_node_title();
        bloodLayer.batchDraw();
    };
    return;
});

function notselected_node_title() {
    x_title.textContent = '—';
    y_title.textContent = '—';
    w_title.textContent = '—';
    h_title.textContent = '—';
    cls_title.textContent = '—';
    conf_title.textContent = '—';
    deleteBtn.disabled = true;

    const existingSelector = document.getElementById('class-selector-wrapper');
    if (existingSelector) existingSelector.style.visibility = 'hidden';
}

function selected_node_title(node) {
    const image = stage.findOne('.image');
    const imgX = image.x();
    const imgY = image.y();    

    // доделать x и y так, чтобы они отображали относительно картинки
    x_title.textContent = parseFloat(node.x() - imgX).toFixed(2)            || '—';
    y_title.textContent = parseFloat(node.y() - imgY).toFixed(2)            || '—';
    w_title.textContent = parseFloat(node.width()).toFixed(2)               || '—';
    h_title.textContent = parseFloat(node.height()).toFixed(2)              || '—';
    cls_title.textContent = classes.get(node.stroke())                      || '—';
    conf_title.textContent = `${(node.getAttr('conf') * 100).toFixed(2)} %` || '—';
    deleteBtn.disabled = false;

    showClassSelector(node);
}

function showClassSelector(node) {
    let wrapper = document.getElementById('class-selector-wrapper');

    const select = document.getElementById('class-selector');
    select.value = node.stroke();
    wrapper.style.visibility = 'visible';

    select.addEventListener('change', () => {
        const selectedNodes = transformer.nodes();
        if (selectedNodes.length === 0) return;
        const targetNode = selectedNodes[0];
        const newColor = select.value;
        targetNode.stroke(newColor);
        cls_title.textContent = classes.get(newColor) || '—';
        conf_title.textContent = '100 %' || '—';
        targetNode.setAttrs({
            conf: parseFloat(1)
        });
        bloodLayer.batchDraw();
    });
}


//Приближение
function zoomInFunc() {
  const oldScale = scale;
  const centerStage = {
      x: stage.width() / 2,
      y: stage.height() / 2
  };
  const localCenter = {
      x: centerStage.x / oldScale - stage.x() / oldScale,
      y: centerStage.y / oldScale - stage.y() / oldScale
  };
  
  scale *= scaleFactor;
  if (scale > 12) scale = 12;
  
  const newX = -(localCenter.x - centerStage.x / scale) * scale;
  const newY = -(localCenter.y - centerStage.y / scale) * scale;
  
  stage.scale({ x: scale, y: scale });
  stage.position({x: newX, y: newY});
  stage.draw();
  transformer.nodes([]);
};

//Отдаление
function zoomOutFunc() {
  const oldScale = scale;
  const centerStage = {
      x: stage.width() / 2,
      y: stage.height() / 2
  };
  const localCenter = {
      x: centerStage.x / oldScale - stage.x() / oldScale,
      y: centerStage.y / oldScale - stage.y() / oldScale
  };
  
  scale /= scaleFactor;
  if (scale > 12) scale = 12;
  
  const newX = -(localCenter.x - centerStage.x / scale) * scale;
  const newY = -(localCenter.y - centerStage.y / scale) * scale;
  
  stage.scale({ x: scale, y: scale });
  stage.position({x: newX, y: newY});
  stage.draw();
  transformer.nodes([]);
};

//Изображение
const app = document.getElementById('app'); 
const img_path = app.dataset.path;

//Параметры изображения
const file_name_title = document.getElementById('file-name');
file_name_title.textContent = app.dataset.name;
const file_date_create_title = document.getElementById('file-date-create');
file_date_create_title.textContent = app.dataset.date;
const file_owner_title = document.getElementById('file-owner');
file_owner_title.textContent = app.dataset.owner;
const file_resolution_title = document.getElementById('file-resolution');
file_resolution_title.textContent = app.dataset.res;
const file_size_title = document.getElementById('file-size');
file_size_title.textContent = app.dataset.size;

const file_name = img_path.slice(img_path.indexOf('image'));
submitNote.textContent = `// ${file_name}`;
let labels = JSON.parse(window.labels);

Konva.Image.fromURL(img_path, (konvaImage) => {
  let image = konvaImage.image();
  let x_position = Math.floor((canvas_div.offsetWidth - image.naturalWidth) / 2);
  let y_position = Math.floor((canvas_div.offsetHeight - image.naturalHeight) / 2);

  konvaImage.setAttrs({
      x: x_position,
      y: y_position,
      name: 'image',
      draggable: false
  });

  //Функции не работают из-за того, что изображение загрузиться не успевает, поэтому тут задаю объект
  imageBox = konvaImage;
  bloodLayer.add(konvaImage);
  bloodLayer.add(transformer);

  for (const item of labels) {
      const rect = rect0.clone();
      // 'basophil','eosinophil','erythrocyte','lymphocyte','monocyte','neutrophil','platelet'

      let colorItem = '';
      if (item.cls == 'basophil') {
          colorItem = '#a78bfa';
      } else if (item.cls == 'eosinophil') {
          colorItem = '#c8f060';
      } else if (item.cls == 'erythrocyte')  {
          colorItem = '#e05252';
      } else if (item.cls == 'lymphocyte') {
          colorItem = '#34d399';
      } else if (item.cls == 'monocyte') {
          colorItem = '#f472b6';
      } else if (item.cls == 'neutrophil') {
          colorItem = '#4da6ff';
      } else if (item.cls == 'platelet') {
          colorItem = '#e8a94d';
      };

      rect.setAttrs({
          x: x_position + item.x - (item.w / 2),
          y: y_position + item.y - (item.h / 2),
          width: item.w,
          height: item.h,
          name: `rect_${counts}`,
          zindex: counts,
          stroke: colorItem,
          visible: true,
          conf: parseFloat(item.conf)
      });
      counts += 1;
      bloodLayer.add(rect);
  };

  bloodLayer.draw();
});

// Включить перетаскивание объектов
function dragOn() {
    const targetNode = bloodLayer.findOne('.image');
    bloodLayer.getChildren().forEach((node) => {
        if (node === targetNode) return;
        node.draggable(true); 
    });
    bloodLayer.batchDraw();
}

// Выключить перетаскивание объектов
function dragOff() {
    const targetNode = bloodLayer.findOne('.image');
    bloodLayer.getChildren().forEach((node) => {
        if (node === targetNode) return;
        node.draggable(false); 
    });
    bloodLayer.batchDraw();
}

// Проверка на отрицательные координаты в боксах
function checkNegativeSize(rect) {
    let height = rect.height();
    let width = rect.width();

    if(height > 0 && width > 0) return rect;

    if(height < 0) {
        rect.height(Math.abs(height));
        rect.y(rect.y() + height);
    };

    if(width < 0) {
        rect.width(Math.abs(width));
        rect.x(rect.x() + width);
    };

    return rect;
}

// Ограничение бокса в границах изображения
function limitDraw(x, y){
    const box = imageBox.getClientRect();
    const minX = box.x;
    const maxX = box.x + box.width;
    const minY = box.y;
    const maxY = box.y + box.height;

    const pos = {
        x: 0,
        y: 0
    };

    pos.x = Math.max(x, minX);
    pos.x = Math.min(pos.x, maxX);
    pos.y = Math.max(y, minY);
    pos.y = Math.min(pos.y, maxY);

    return pos;
}

// Импортирование боксов в данные для БД
function getLabels(){
  let rectangles = stage.find('Rect'); 

  const image = stage.findOne('.image');
  const imgX = image.x();
  const imgY = image.y();

  let labels = [];

  for(let i = 0; i < rectangles.length; i++) {
      if (rectangles[i] instanceof Konva.Rect && rectangles[i].name() !== 'image' && rectangles[i].name().includes('rect')) {
              let classBox = 1;

              if (rectangles[i].stroke() === '#a78bfa') {
                  classBox = 0;
              } else if (rectangles[i].stroke() === '#c8f060') {
                  classBox = 1;
              } else if (rectangles[i].stroke() === '#e05252') {
                  classBox = 2;
              } else if (rectangles[i].stroke() === '#34d399') {
                  classBox = 3;
              } else if (rectangles[i].stroke() === '#f472b6') {
                  classBox = 4;
              } else if (rectangles[i].stroke() === '#4da6ff') {
                  classBox = 5;
              } else if (rectangles[i].stroke() === '#e8a94d') {
                  classBox = 6;
              };

              const label = {
                  cls: classBox, 
                  conf: rectangles[i].getAttr('conf'), 
                  x: (rectangles[i].x() + (rectangles[i].width() / 2) - imgX), 
                  y: (rectangles[i].y() + (rectangles[i].height() / 2) - imgY), 
                  w: rectangles[i].width(), 
                  h: rectangles[i].height(),
                  edit: true
              };
              labels.push(label);
      };
  };
  return labels;
}

// Вызов функций при нажатии на кнопки инструментов
const toolHandlers = {
  cursor:  () => {
    dragOn();
    tool = 'cursor';
    notselected_node_title();
  },
  hand:    () => {
    dragOff();
    tool = 'hand';
    transformer.nodes([]);
    notselected_node_title();
  },
  label: () => {
    tool = "labeling";
    transformer.nodes([]);
  },  
  zoomin:  () => {
    zoomInFunc();
    notselected_node_title();
  },
  zoomout: () => {
    zoomOutFunc();
    notselected_node_title();
  },
};


// Кнопки разметки
document.querySelectorAll('.cell-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cell-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));

    color = btn.dataset.color;
    (toolHandlers['label'] || (() => {}))();
  });
});


// Кнопки инструментов
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const toolType = btn.dataset.tool;

    if (toolType === 'zoomin' || toolType === 'zoomout') {
      (toolHandlers[toolType] || (() => {}))();

      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 150);
      return;
    }
    tool = toolType;

    document.querySelectorAll('.cell-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    (toolHandlers[toolType] || (() => {}))();
  });
});

//Перетаскивание
stage.addEventListener("mousedown", (e)=> {
  if(tool === 'hand'){
    isDraggible = true;
    olderPosition = stage.getPointerPosition();
  };
});

stage.addEventListener("mousemove", (e)=> {
    if(tool !== 'hand' || isDraggible == false) return;
    newPosition = stage.getPointerPosition();

    shift.x += (olderPosition.x - newPosition.x);
    shift.y += (olderPosition.y - newPosition.y);

    stage.position({
            x: stage.x() - ((olderPosition.x - newPosition.x)),
            y: stage.y() - ((olderPosition.y - newPosition.y))
    });

    olderPosition = stage.getPointerPosition();
});

stage.addEventListener("mouseup", (e) => {
  if(tool === 'hand') isDraggible = false;
});
 

// Стандартный bbox
const rect0 = new Konva.Rect({
    visible: false,
    fill: 'transparent',
    strokeWidth: 1,
    stroke: '#e05252',
    draggable: false,
    strokeScaleEnabled: false,
    conf: parseFloat(1),

    dragBoundFunc: function(pos) {
        // pos приходит в абсолютных координатах canvas (с учётом scale и смещения stage)
        // imageBox.getClientRect() тоже в абсолютных координатах
        const box = imageBox.getClientRect();
        const objRect = this.getClientRect();

        // Зажимаем позицию так, чтобы бокс не выходил за границы изображения
        const clampedX = Math.max(box.x, Math.min(pos.x, box.x + box.width - objRect.width));
        const clampedY = Math.max(box.y, Math.min(pos.y, box.y + box.height - objRect.height));

        // Переводим обратно в координаты слоя (убираем смещение stage)
        return {
            x: clampedX,
            y: clampedY
        };
    }
});


// Трансформатор
const transformer = new Konva.Transformer({
    rotateEnabled: false,
    keepRatio: false,
    ignoreStroke: true, 
    boundBoxFunc: function(oldBox, newBox) {
        const box = imageBox.getClientRect();

        // Минимальный размер бокса
        const MIN_SIZE = 5;

        // Зажимаем левую границу: если x вышел за левый край, фиксируем x и уменьшаем ширину
        if (newBox.x < box.x) {
            newBox.width += newBox.x - box.x;
            newBox.x = box.x;
        }

        // Зажимаем верхнюю границу: если y вышел за верхний край, фиксируем y и уменьшаем высоту
        if (newBox.y < box.y) {
            newBox.height += newBox.y - box.y;
            newBox.y = box.y;
        }

        // Зажимаем правую границу: если правый край вышел за пределы, уменьшаем ширину
        if (newBox.x + newBox.width > box.x + box.width) {
            newBox.width = box.x + box.width - newBox.x;
        }

        // Зажимаем нижнюю границу: если нижний край вышел за пределы, уменьшаем высоту
        if (newBox.y + newBox.height > box.y + box.height) {
            newBox.height = box.y + box.height - newBox.y;
        }

        // Не даём боксу стать меньше минимума
        if (Math.abs(newBox.width) < MIN_SIZE || Math.abs(newBox.height) < MIN_SIZE) {
            return oldBox;
        }

        return newBox;
    }
});


// Создание бокса
stage.addEventListener("click", (e)=> {
  if (tool === 'cursor'){
      const pos = stage.getPointerPosition();
      const node = stage.getIntersection(pos);

      if (node === stage || node === transformer || 
        node === bloodLayer || node.name() === 'image' || !node) {
            notselected_node_title();
            console.log(`Node does not adequate`);
            transformer.nodes([]);
            return;
      };

      if (node instanceof Konva.Node){
          try {
            transformer.nodes([node]); 
            console.log(transformer.nodes());
            selected_node_title(node);
            transformer.moveToTop();
          } catch (error) {
            notselected_node_title();
            console.log(`Error: ${error}`);
            transformer.nodes([]);
          }
      } else {
        notselected_node_title();
        console.log(`Node does not from Konva`);
        transformer.nodes([]);
      }
      return;
  }; 
  
  if (tool === 'labeling'){
      if (isClick == true) {
          newPosition = stage.getPointerPosition();
          newPosition = limitDraw(newPosition.x, newPosition.y);

          const rectangleEnd = bloodLayer.findOne(`.rect_${counts}`);
          rectangleEnd.setAttrs({
              width: (newPosition.x / scale - olderPosition.x / scale),
              height: (newPosition.y / scale - olderPosition.y / scale)
          });
          checkNegativeSize(rectangleEnd).draggable(true);

          counts += 1;
          isClick = false;
          bloodLayer.draw();
          return;
      };
  
      olderPosition = stage.getPointerPosition();
      olderPosition = limitDraw(olderPosition.x, olderPosition.y);

      isClick = true;
      const rectangle = rect0.clone();
      rectangle.setAttrs({
          x: olderPosition.x / scale - stage.x() / scale,
          y: olderPosition.y / scale - stage.y() / scale,
          visible: true,
          name: `rect_${counts}`,
          zindex: counts,
          stroke: color
      });

      bloodLayer.add(rectangle);
      bloodLayer.draw();
      return;
  };
});

stage.addEventListener("mousemove", (e) => {
  if (isClick == false || tool !== 'labeling') return;

  newPosition = stage.getPointerPosition();
  newPosition = limitDraw(newPosition.x, newPosition.y);

  const rectangle = bloodLayer.findOne(`.rect_${counts}`);
  rectangle.setAttrs({
      width: (newPosition.x / scale - olderPosition.x / scale),
      height: (newPosition.y / scale - olderPosition.y / scale)
  });

  bloodLayer.draw();
});

// Сохранение изменений в БД
const save_btn = document.getElementById("submitBtn");
save_btn.addEventListener("click", () => {
    const classes = {
        "basophil": 0,
        "eosinophil": 1,
        "erythrocyte": 2,
        "lymphocyte": 3,
        "monocyte": 4,
        "neutrophil": 5,
        "platelet": 6
    }
    const file_name = img_path.slice(img_path.indexOf('image'));

    let labels = getLabels();
    let bodyString = JSON.stringify({
        image_name: file_name,
        class_names: classes,
        boxes: labels
    });

    console.log(`${bodyString}`);

    if(confirm("Вы уверены, что хотите сохранить новые данные? Прошлые данные будут удалены.")){
        notify('Сохранение', `Сохранение изменений`, 'info');
        fetch(`${window.location.pathname}/save`, {
            method: "post",
            body: bodyString,
            headers: {"Content-Type": "application/json"}
        })
        .then(response => {
            return response.json();
        })
        .then(responseData => {
            if(responseData.status == true) {
                notify('Статус сохранения', `${responseData.description}`, 'info');
                setTimeout(() => {
                    window.location.href = `/image/${file_name}`;
                }, 2000);
            } else {
              notify('Ошибка загрузки новых данных', `${responseData.description}`, 'error');
            };
        })
    }
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


// // Горячие кнопки (когда-нибудь)
// document.addEventListener('keydown', (e) => {
//   if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

//   const map = { 'v': 'cursor', 'h': 'hand', '+': 'zoomin', '-': 'zoomout' };
//   const tool = map[e.key.toLowerCase()];
//   if (!tool) return;

//   const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
//   if (btn) btn.click();
// });
