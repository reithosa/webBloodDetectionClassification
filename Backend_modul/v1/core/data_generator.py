from ultralytics import YOLO
from pathlib import Path
from v1.core.model_type1 import Images, Statistics_image, Labels


def generate():
    stats, labels, images = [], [], []
    model = YOLO(r"D:\webBloodDetection\Backend_modul\ML\rbc_model.pt")
    folder = Path(r".\uploads")
    i = 1
    for file in folder.iterdir():
        if file.is_file():
            image = file.resolve()
            results = model(
                    image,
                    verbose=False,
                    conf=0.3,
                    iou=0.3
                )
            
            result = results[0]
            #print(f"image{i} = Images(file_name='{file.name}', file_path='{image}')")
            #print(f"stat{i} = Statistics_image(id_image={i}, descriptions='test')")
            stats.append(Images(file_name=str(file.name), file_path=f"\\uploads\\{file.name}"))
            images.append(Statistics_image(id_image=i, descriptions="test"))
            n = 0
            for box in result.boxes:
                x, y, w, h = box.xywh[0][0].item(), box.xywh[0][1].item(), box.xywh[0][2].item(), box.xywh[0][3].item() #там почему-то тензор двумерный массив, так что надо так писать [0][3]
                conf = box.conf[0].item()
                cls = int(box.cls[0].item()) #box.cls возвращается тензор, поэтому нужно использова обращение к первому и единственному элементу [0] 
                labels.append(Labels(id_image=i, cls=model.names[cls], conf=conf, x=round(x, 2), y=round(y, 2), w=round(w, 2), h=round(h, 2)))
            i += 1
    return labels, images, stats

if __name__=="__main__":
    pass