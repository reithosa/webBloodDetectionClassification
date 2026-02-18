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
    let type_cell = "";
    let counts = 1;
    
    const canvas_div = document.getElementById('canvas_div');
    const stage = new Konva.Stage({
        container: canvas_div,
        width: canvas_div.offsetWidth,
        height: canvas_div.offsetHeight
    });
    
    const bloodLayer = new Konva.Layer();
    stage.add(bloodLayer);


    const rect0 = new Konva.Rect({
        visible: false,
        fill: 'transparent',
        strokeWidth: 1,
        stroke: 'red',
        draggable: false,
        strokeScaleEnabled: false,

        dragBoundFunc: function(pos) {
            const box = imageBox.getClientRect();
            const objRect = this.getClientRect();

            pos.x = Math.max(pos.x, box.x);
            pos.x = Math.min(pos.x, box.x + box.width - objRect.width);
            pos.y = Math.max(pos.y, box.y);
            pos.y = Math.min(pos.y, box.y + box.height - objRect.height);
            
            return {
                x: pos.x,
                y: pos.y
            };
        }
    });


    const transformer = new Konva.Transformer({
        rotateEnabled: false,
        keepRatio: false,
        ignoreStroke: true, 
        boundBoxFunc: function(oldBox, newBox) {
            const box = imageBox.getClientRect();

            if (newBox.x < box.x) {
                newBox.x = box.x;
            }

            if (newBox.y < box.y) {
                newBox.y = box.y;
            }

            if (newBox.x + newBox.width > box.x + box.width) {
                newBox.x = box.x + box.width - newBox.width;
            }

            if (newBox.y + newBox.height > box.y + box.height) {
                newBox.y = box.y + box.height - newBox.height;
            }
            
            //newBox.width = Math.max(newBox.width, 10);
            //newBox.height = Math.max(newBox.height, 10);
            return newBox;
        }
    });
    

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
        bloodLayer.add(transformer);

        for (const item of labels) {
            const rect = rect0.clone();
            
            let color = '';
            if (item.cls == 'WBC') {
                color = 'purple';
            } else if (item.cls == 'Platelet') {
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
    //сбор всех данных 
    function getLabels(){
        let rectangles = stage.find('Rect'); 

        const image = stage.findOne('.image');
        const imgX = image.x();
        const imgY = image.y();

        let labels = [];

        for(let i = 0; i < rectangles.length; i++) {
            if (rectangles[i] instanceof Konva.Rect && rectangles[i].name() !== 'image' && rectangles[i].name().includes('rect')) {
                    let classBox = 1;

                    if (rectangles[i].stroke() === 'red') {
                        classBox = 1;
                    } else if (rectangles[i].stroke() === 'DarkSlateGray') {
                        classBox = 0;
                    } else {
                        classBox = 2;
                    };

                    const label = {
                        cls: classBox, 
                        conf: 1, 
                        x: (rectangles[i].x() + (rectangles[i].width() / 2) - imgX) / scale, 
                        y: (rectangles[i].y() + (rectangles[i].height() / 2) - imgY) / scale, 
                        w: rectangles[i].width() / scale, 
                        h: rectangles[i].height() / scale,
                        edit: true
                    };
                    labels.push(label);
            };
        };
        return labels;
    }

    //Ограничение перемещения объектов
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

    //Проверка на негативную длину и ширину
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

    //Отключение перетаскивания
    function dragOff() {
        const targetNode = bloodLayer.findOne('.image');
        bloodLayer.getChildren().forEach((node) => {
            if (node === targetNode) return;
            node.draggable(false); 
        });
        bloodLayer.batchDraw();
    }
    //Включение перетаскивания
    function dragOn() {
        const targetNode = bloodLayer.findOne('.image');
        bloodLayer.getChildren().forEach((node) => {
            if (node === targetNode) return;
            node.draggable(true); 
        });
        bloodLayer.batchDraw();
    }


    /*-------------
    | Инструменты |
    -------------*/

    //Перетаскивание
    const hand = document.getElementById('hand');
    hand.addEventListener('click', () => {
        dragOn();
        tool = 'hand';
        transformer.nodes([]);
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
        transformer.nodes([]);
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
        transformer.nodes([]);
    });

    //Изменение боксов 
    const cursor = document.getElementById('cursor');
    cursor.addEventListener('click', () => {
        dragOn();
        tool = 'cursor';
        transformer.nodes([]);
    });

    //Разметка
    const red_cell = document.getElementById('red_cell');
    let isClick = false;


    //Кнопки различных клеток
    red_cell.addEventListener('click', () => {
        dragOn();
        tool = 'labeling';
        type_cell = 'red';
        transformer.nodes([]);
    });

    plat_cell.addEventListener('click', () => {
        dragOn();
        tool = 'labeling';
        type_cell = 'DarkSlateGray';
        transformer.nodes([]);
    });

    bas_cell.addEventListener('click', () => {
        dragOn();
        tool = 'labeling';
        type_cell = 'blue';
        transformer.nodes([]);
    });

    neu_cell.addEventListener('click', () => {
        dragOn();
        tool = 'labeling';
        type_cell = 'green';
        transformer.nodes([]);
    });

    eo_cell.addEventListener('click', () => {
        dragOn();
        tool = 'labeling';
        type_cell = 'cyan';
        transformer.nodes([]);
    });

    mono_cell.addEventListener('click', () => {
        dragOn();
        tool = 'labeling';
        type_cell = 'purple';
        transformer.nodes([]);
    });

    lymph_cell.addEventListener('click', () => {
        dragOn();
        tool = 'labeling';
        type_cell = 'Lime';
        transformer.nodes([]);
    });


    stage.addEventListener("click", (e)=> {
        if (tool === 'cursor'){
            const pos = stage.getPointerPosition();
            const node = stage.getIntersection(pos);

            if (node === stage || node === transformer || 
                node === bloodLayer || node.name() === 'image' || !node) {
                console.log(transformer.nodes());
                console.log(`Node does not adequate`);
                transformer.nodes([]);
                return;
            };

            if (node instanceof Konva.Node){
                try {
                    transformer.nodes([node]); 
                    console.log(transformer.nodes());
                    transformer.moveToTop();
                } catch (error) {
                    console.log(`Error: ${error}`);
                    transformer.nodes([]);
                }
            } else {
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
                stroke: type_cell
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


    //Кнопка удаления объекта
    const delete_btn = document.getElementById("delete_button");
    delete_btn.addEventListener("click", () => {
        if (tool === 'cursor'){
            if(transformer.nodes().length !== 0) {
                const rects = transformer.nodes();
                rects.forEach(rect => {
                    console.log(`Deleting ${rect.name()}`);
                    rect.destroy();
                });
                transformer.nodes([]);
                bloodLayer.batchDraw();
            };
            return;
        };
        return;
    });



    //Кнопка сохранения объекта

            // {
        //     "id_image": 0,
        //     "image_shape": [360, 360],
        //     "class_names": {
        //         "0": "Platelet",
        //         "1": "RBC",
        //         "2": "WBC"
        //     },
        //     "boxes": []
        // }
    const save_btn = document.getElementById("save_button");
    save_btn.addEventListener("click", () => {

        const classes = {
            "Platelet": 0,
            "RBC": 1,
            "WBC": 2
        }
        const file_name = img_path.slice(img_path.indexOf('image'))

        let labels = getLabels();
        let bodyString = JSON.stringify({
            image_name: file_name,
            class_names: classes,
            boxes: labels
        });

        console.log(`${bodyString}`);

        if(confirm("Вы уверены, что хотите сохранить новые данные? Прошлые данные будут удалены.")){
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
                    alert(responseData.description);
                    setTimeout(() => {
                        window.location.href = `/image/${file_name}`;
                    }, 1000);
                } else {
                    alert(responseData.description);
                };
            })
        }
    });
});
