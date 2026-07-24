"use strict";

// Уведомления
function notify(title, text, type = 'info') {
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#c8f060" stroke-width="1.2"/><path d="M5 8l2.5 2.5L11 5.5" stroke="#c8f060" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#ff4757" stroke-width="1.2"/><path d="M8 5v3.5M8 10.5v.5" stroke="#ff4757" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#4da6ff" stroke-width="1.2"/><path d="M8 7v4M8 5.5v.5" stroke="#4da6ff" stroke-width="1.4" stroke-linecap="round"/></svg>`
  };
  const n = document.createElement('div');
  n.className = `notif ${type}`;
  n.innerHTML = `<div class="notif-icon">${icons[type]}</div><div class="notif-text"><div class="notif-title">${title}</div>${text}</div>`;
  document.getElementById('notifications').prepend(n);
  setTimeout(() => {
    n.style.opacity = '0';
    n.style.transform = 'translateX(10px)';
    setTimeout(() => n.remove(), 300);
  }, 4000);
}

// Nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Выбор карточки
const editBtn   = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');

const sidebarFields = {
  name:       document.getElementById('file-name'),
  date:       document.getElementById('file-date-create'),
  owner:      document.getElementById('file-owner'),
  resolution: document.getElementById('file-resolution'),
  size:       document.getElementById('file-size'),
  rbc:        document.getElementById('rbc'),
  plt:        document.getElementById('plt'),
  eos:        document.getElementById('eos'),
  bas:        document.getElementById('bas'),
  neu:        document.getElementById('neu'),
  mon:        document.getElementById('mon'),
  lym:        document.getElementById('lym'),
};

function selectItem(card) {
  document.querySelectorAll('.item').forEach(c => {
    c.classList.remove('selected');
  });

  card.classList.add('selected');

  sidebarFields.name.textContent       = card.dataset.name       || '—';
  sidebarFields.date.textContent       = card.dataset.date       || '—';
  sidebarFields.owner.textContent      = card.dataset.owner      || '—';
  sidebarFields.resolution.textContent = card.dataset.res        || '—';
  sidebarFields.size.textContent       = card.dataset.size       || '—';
  sidebarFields.rbc.textContent        = card.dataset.rbc        || '—';
  sidebarFields.plt.textContent        = card.dataset.plt        || '—';
  sidebarFields.eos.textContent        = card.dataset.eos        || '—';
  sidebarFields.bas.textContent        = card.dataset.bas        || '—';
  sidebarFields.neu.textContent        = card.dataset.neu        || '—';
  sidebarFields.mon.textContent        = card.dataset.mon        || '—';
  sidebarFields.lym.textContent        = card.dataset.lym        || '—';

  editBtn.disabled   = false;
  deleteBtn.disabled = false;
}

function unselectItem() {
  document.querySelectorAll('.item').forEach(c => {
    c.classList.remove('selected');
  });

  sidebarFields.name.textContent       = '—';
  sidebarFields.date.textContent       = '—';
  sidebarFields.owner.textContent      = '—';
  sidebarFields.resolution.textContent = '—';
  sidebarFields.size.textContent       = '—';
  sidebarFields.rbc.textContent        = '—';
  sidebarFields.plt.textContent        = '—';
  sidebarFields.eos.textContent        = '—';
  sidebarFields.bas.textContent        = '—';
  sidebarFields.neu.textContent        = '—';
  sidebarFields.mon.textContent        = '—';
  sidebarFields.lym.textContent        = '—';
}

const itemsArea = document.getElementById('itemsArea');

itemsArea.addEventListener('click', (event) => {
    const card = event.target.closest('.item');
    if (card) {
        selectItem(card);
    }
});

// Удаление и просмотр изображения
editBtn.addEventListener('click', () => {
  const sel = document.querySelector('.item.selected');
  if (!sel) return;
  notify('Открытие файла', sel.dataset.name, 'info');
  setTimeout(() => {
    window.location.href = `/image/${sel.dataset.name}`;
  }, 120);
});

deleteBtn.addEventListener('click', () => {
  const sel = document.querySelector('.item.selected');
  if (!sel) return;

  if(confirm("Вы уверены, что хотите удалить изображение?")){
    sel.style.opacity = '0';
    sel.style.transform = 'scale(0.95)';
    sel.style.transition = 'opacity 0.25s, transform 0.25s';
    setTimeout(() => {
      sel.remove();
      editBtn.disabled   = true;
      deleteBtn.disabled = true;
      Object.values(sidebarFields).forEach(f => f.textContent = '—');
    }, 280);
    fetch(`/${sel.dataset.name}/delete`, {
        method: "post",
    })
    .then(response => {
        return response.json();
    })
    .then(responseData => {
        if(responseData.status == true) {
            let str_result = (responseData.del_file ? `Файл ${responseData.image} удалён.` : `Файл ${responseData.image} НЕ удалён.`) + " " + (responseData.del_row ? `Данные ${responseData.image} удалены.` : `Данные ${responseData.image} НЕ удалены.`);
            notify(`Файл ${responseData.image} удалён `, str_result, 'error');
            setTimeout(() => {
                window.location.reload;
            }, 1000);
        } else {
            let str_result = (responseData.del_file ? `Файл ${responseData.image} удалён.` : `Файл ${responseData.image} НЕ удалён.`) + " " + (responseData.del_row ? `Данные ${responseData.image} удалены.` : `Данные ${responseData.image} НЕ удалены.`);
            notify(`Файл ${responseData.image} удалён `, str_result, 'error');
        };
    });
  };
});


// Страницы
let currentPage = 1;
const totalPages = 999;

const pagePrev    = document.getElementById('pagePrev');
const pageNext    = document.getElementById('pageNext');
const pageNumbers = document.getElementById('pageNumbers');

function updatePagination(page) {
  currentPage = page;
  pagePrev.disabled = (page === 1);
  pageNext.disabled = (page === parseInt(pageNext.dataset.max));

  document.querySelectorAll('.page-num').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.page) === page);
  });
  update_page(currentPage);
}

pageNumbers.addEventListener('click', e => {
  const btn = e.target.closest('.page-num');
  if (!btn) return;
  updatePagination(parseInt(btn.dataset.page));
  notify('Страница ' + currentPage, '', 'info');
});

pagePrev.addEventListener('click', () => {
  if (currentPage > 1) updatePagination(currentPage - 1);
});

pageNext.addEventListener('click', () => {
  if (currentPage < totalPages) updatePagination(currentPage + 1);
});

function update_page(page = 1){
  unselectItem();

  fetch(`/images/get?page=${page - 1}`, {
    method: "get",
  })
  .then(response =>{
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return response.text();
  })
  .then(divs => {
    itemsArea.innerHTML = divs;
  })
  .catch(error => {
    notify(toString(error),toString(error), 'error');
  });
};

document.addEventListener("DOMContentLoaded", () => {
  update_page(currentPage);
  updatePagination(1);
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
