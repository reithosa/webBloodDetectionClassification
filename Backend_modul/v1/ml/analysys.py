from ultralytics import YOLO
from v1.config.paths import MODELS_ML_PATH
from v1.core.model_type1 import Images, Statistics_image, Labels

model = YOLO(MODELS_ML_PATH + "\\rbc_model.pt")

def search_cells(path):
    results = model(
        path,
        verbose=False,
        conf=0.3,
        iou=0.3
    )
    print("=" * 100)
    print("Обработка МЛ")
    print(results[0].boxes.xywh)
    print("=" * 100)
    return results[0]

    

