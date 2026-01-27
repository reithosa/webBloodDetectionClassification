"use strict";
document.addEventListener('DOMContentLoaded', ()=> {
    const navigator = document.getElementById("nav_link");
    const navigator_window = document.getElementById("win_nav");
    const cross = document.getElementById("win_nav_cross");
    const title_site_name = document.getElementById('title_site_name');
    const overlay = document.createElement('div');
    overlay.className = "menu_overlay";
    document.body.appendChild(overlay);

    title_site_name.addEventListener('click', () => {
        //Переход на главную страницу
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

    const input = document.getElementById("input");
    const trigger = document.getElementById("blood_buttom");
    
    trigger.addEventListener('click', () => {
        input.click();
    });
    
    input.addEventListener('change', () =>{
        alert("Файл выбран");
        let input = document.querySelector('input[type="file"]');
        let data = new FormData();
        data.append('image', input.files[0]);

        fetch('/image', {
            method: 'POST',
            body: data
        }) 
        .then(response => {
            console.log("Status: ", response.status);
            return response.json()
        })
        .then(responseData => {
            if (responseData.status == "ok"){
                let file_name = responseData.file_name
                alert(`Status: ${responseData.status}, file_name: ${file_name}`)
                console.log("Response Data: ", responseData);
                setTimeout(() => {
                    console.log("File name: ", file_name);
                    //window.location.href = `/getfile/${file_name}`;
                }, 1000);
            };
        })
        .catch(error => {
            console.log("Error: ", error);
        });
        console.log("Файл отправлен");
    });
});