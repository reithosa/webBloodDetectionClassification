from fastapi import FastAPI, Request, File, UploadFile
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from pathlib import Path

from ultralytics import YOLO
import cv2


DIR = Path("__file__").parent

model = YOLO(r"D:\webBloodDetection\Backend_modul\ML\rbc_model.pt")
app = FastAPI() 
app.mount("/static", StaticFiles(directory = Path(__file__).parent / "static"), name="static")
templates = Jinja2Templates(directory= Path(__file__).parent / "templates")



@app.post('/request')
async def req(text: Request):
    data = await text.json()
    print(data.keys())
    if data:
        return {"".join(data.keys()): data.get("".join(data.keys()))} #key - это ключ запроса, который мы отправили через curl
    return {"message": "None request"}
    
    
@app.get('/', response_class=HTMLResponse)
def start_page(request: Request):
    return templates.TemplateResponse(
        "index.html", 
        {
            "request": request
        }
    )

@app.post('/file')
def post_file(image: UploadFile):
    file = image.file
    file_name = image.filename
    str_path = Path(__file__).parent / "static" / "images" / file_name
    with open(str_path, "wb") as f:
        f.write(file.read())

    results = model(
             str_path,
             verbose=False,
             conf=0.3,
             iou=0.3
        )
    result = results[0]
    cv2.imwrite(str_path, result.plot())

    return {
        "status": "success", 
        "file_name" : str(file_name)
    }

@app.get('/getfile/{file_name}', response_class=HTMLResponse)
def get_file(request: Request, file_name: str):
    print(file_name)
    return templates.TemplateResponse(
        "image.html",
        {
            "request": request,
            "file_name": file_name
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)