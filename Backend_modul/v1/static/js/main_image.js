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

    const delete_btn = document.getElementById('delete_button');
    delete_btn.addEventListener("click", ()=> {
        if(confirm("Вы уверены, что хотите удалить объект?")){
            fetch(`${window.location.pathname}/delete`, {
                method: "post",
            })
            .then(response => {
                return response.json();
            })
            .then(responseData => {
                if(responseData.status == true) {
                    let str_result = (responseData.del_file ? `Файл ${responseData.image} удалён.` : `Файл ${responseData.image} НЕ удалён.`) + " " + (responseData.del_row ? `Данные ${responseData.image} удалены.` : `Данные ${responseData.image} НЕ удалены.`);
                    console.log(str_result)
                    alert(str_result);
                    setTimeout(() => {
                        window.location.href = `/`;
                    }, 1000);
                } else {
                    let str_result = (responseData.del_file ? `Файл ${responseData.image} удалён.` : `Файл ${responseData.image} НЕ удалён.`) + " " + (responseData.del_row ? `Данные ${responseData.image} удалены.` : `Данные ${responseData.image} НЕ удалены.`);
                    console.log(str_result)
                    alert(str_result);
                };
            })
        }
    });

    const change_btn = document.getElementById("change_button");
    change_btn.addEventListener("click", ()=>{

    });

    const stat_btn = document.getElementById("stat_button");
    stat_btn.addEventListener("click", ()=>{

    });

});