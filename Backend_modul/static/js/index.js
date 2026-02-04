"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById("input");
    const trigger = document.getElementById("blood_buttom");
    
    trigger.addEventListener('click', () => {
        input.click();
    });
    
    input.addEventListener('change', () =>{
        alert("Файл выбран");
        let input = document.querySelector('input[type="file"]');
        console.log("Файл выбран");
        let data = new FormData();
        data.append('image', input.files[0]);

        fetch('/file', {
            method: 'POST',
            body: data
        }) 
        .then(response => {
            console.log("Status: ", response.status);
            return response.json()
        })
        .then(responseData => {
            if (responseData.status == "success"){
                let file_name = responseData.file_name
                console.log("File name: ", responseData);
                setTimeout(() => {
                    console.log(file_name);
                    window.location.href = `/getfile/${file_name}`;
                }, 1000);
            };
            console.log("Response: ", responseData);
            console.log("Status: ", responseData.status);
        })
        .catch(error => {
            console.log("Error: ", error);
        });
        console.log("Файл отправлен");
    });
});
