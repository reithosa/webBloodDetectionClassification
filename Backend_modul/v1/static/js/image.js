"use strict"

document.addEventListener("DOMContentLoaded", () => {
    // // // // // // //
    // // Редактор // //
    // // // // // // //

    //Переменные
    let tool = "cursor";
    let isDraggible = false;
    const scaleFactor = 1.2; 
    let olderPosition = {x: 0, y: 0};
    let newPosition = {x: 0, y: 0};
    let shift = {x: 0, y: 0};
    let scale = 1;
    let imageBox = null;

    const rect0 = new Konva.Rect({
        visible: false,
        fill: 'transparent',
        strokeWidth: 1,
        stroke: 'red',
        draggable: false,
        strokeScaleEnabled: false,
    });
    
    const canvas_div = document.getElementById('canvas_div');
    const stage = new Konva.Stage({
        container: canvas_div,
        width: canvas_div.offsetWidth,
        height: canvas_div.offsetHeight
    });
    
    const bloodLayer = new Konva.Layer();
    stage.add(bloodLayer);
    
    const app = document.getElementById('app'); 
    const img_path = app.dataset.path;
    let labels = JSON.parse(window.labels);
    

    //Изображение с кровью
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

        let counts = 1
        for (const item of labels) {
            const rect = rect0.clone();
            
            let color = '';
            if (item.cls == 'WBC') {
                color = 'purple';
            } else if (item.cls == 'PLT') {
                color = 'DarkSlateGray';
            } else {
                color = 'red';
            }
            rect.setAttrs({
                x: x_position + item.x - (item.w / 2),
                y: y_position + item.y - (item.h / 2),
                width: item.w,
                height: item.h,
                name: `rect_${counts}`,
                zindex: counts,
                stroke: color,
                visible: true,
            });
            counts += 1;
            bloodLayer.add(rect);
        };
        bloodLayer.draw();
    });

    /*---------
    | Функции |
    ---------*/


    /*-------------
    | Инструменты |
    -------------*/

    //Перетаскивание
    const hand = document.getElementById('hand');
    hand.addEventListener('click', () => {
        tool = 'hand';
    });

    stage.addEventListener("mousedown", (e)=> {
            if(tool !== 'hand') return;
            isDraggible = true;
            olderPosition = stage.getPointerPosition();
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
        if(tool !== 'hand') return;
        isDraggible = false;
    });


    //Зум
    const zoom = document.getElementById('loop_plus');
    const zoom_out = document.getElementById('loop_minus');

    zoom.addEventListener('click', () => {
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
    });
    

    zoom_out.addEventListener('click', () => {
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
    });

    //Изменение боксов 
    const cursor = document.getElementById('cursor');
    cursor.addEventListener('click', () => {
        tool = 'cursor';
    });
});
