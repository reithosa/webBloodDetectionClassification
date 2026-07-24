from ultralytics import YOLO
from v4.config.paths import MODELS_ML_PATH

model = YOLO(MODELS_ML_PATH + "\\best.pt")

def search_cells(confidence, path):
    results = model(
        source=path,
        verbose=False,
        conf=confidence,
        iou=0.3,
        agnostic_nms=True,
    )
    print("Обработка YOLO \n func: search_cells \n modul: analysys.py \n")
    print(results[0])

    return results[0]

    

