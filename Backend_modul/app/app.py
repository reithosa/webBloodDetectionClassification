from fastapi import FastAPI, File, UploadFile, Form
from ultralytics import YOLO

import supervision as sv
import pandas as pd
import numpy as np
import shutil
import cv2

app = FastAPI()
model = YOLO(r"D:\webBloodDetection\Backend_modul\ML\rbc_model.pt")


@app.get("/")
def read_root():
    return {"message" : "Hello, World"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
#D:\webBloodDetection\Backend_modul>curl -v -X POST http://127.0.0.1:8000/analyze -F "file=@sample.jpg"
    #Отправка в предобработку и тд.
    #Генерация id 
    #Отправка данных о вводе в БД
    #Отправка клиенту ответа об начале анализа.
    
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    results = model(
             image,
             verbose=False,
             conf=0.3,
             iou=0.3
        )
    if len(results)!=0:
        result = results[0]
        annotated_image = result.plot()
        cv2.imwrite('D:/webBloodDetection/Backend_modul/images/annotated.jpg', annotated_image)
        return {"analyze_status" : "good"}
    else:
        return {"analyze_status" : "bad"}


@app.get("/status/{id}")
async def search(id: int):
    #поиск в PostgreSQL
    if id==1:
        return {"status" : "processed"}
    if id==2:
        return {"status" : "ready"}

@app.get("/result/{id}")
async def get_result(id: int):
    #поиск в PostgreSQL
    if id==1:
        return {"result" : "report1"}
    if id==2:
        return {"result" : "report2"}
