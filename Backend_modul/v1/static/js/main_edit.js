"use strict";
document.addEventListener('DOMContentLoaded', ()=> {
    const navigator = document.getElementById("nav_link");
    const navigator_window = document.getElementById("win_nav");
    const cross = document.getElementById("win_nav_cross");
    const nameSite = document.getElementById('nameSite');
    const overlay = document.createElement('div');
    overlay.className = "menu_overlay";
    document.body.appendChild(overlay);

    nameSite.addEventListener('click', () => {
        window.location.href = `/`;
    });

    navigator.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.classList.add('active');
        navigator_window.classList.add('open');
    });

    overlay.addEventListener('click', (e) => {
        overlay.classList.remove('active');
        navigator_window.classList.remove('open');
    });

    cross.addEventListener('click', (e) => {
        navigator_window.classList.remove('open');
        overlay.classList.remove('active');
    });

});