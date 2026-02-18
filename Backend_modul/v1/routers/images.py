from fastapi import Request, APIRouter
from fastapi.templating import Jinja2Templates
from json import dumps
from pydantic import BaseModel
from typing import List, Dict
from v1.config.paths import APP_PATH, TEMPLATES_PATH, IMAGES_PATH, STYLE_PATH, JS_PATH
from v1.core.conn import conn
from v1.core.queries import get_image_path_id, get_image_labels, delete_image, delete_labels, uploud_labels_frontend
from v1.core.pydantic_models import ImageBoxes, Box


images_router = APIRouter(prefix='/image', tags=['Frontend'])
templates = Jinja2Templates(directory=TEMPLATES_PATH)

@images_router.get('/{file_name}')
async def get_image(request: Request, file_name: str):
    engine = conn()
    data_image = get_image_path_id(engine, file_name)
    labels = dumps(get_image_labels(engine, data_image["id"]))
    return templates.TemplateResponse(name='image.html', context={'request': request,
                                                    'image_path': data_image["path"],
                                                    'image_labels': labels})

@images_router.post('/{file_name}/delete')
async def del_image(file_name: str):
    print("Point activate")
    engine = conn()
    result = delete_image(file_name, engine)
    return result


@images_router.get('/{file_name}/editor')
async def get_image(request: Request, file_name: str):
    engine = conn()
    data_image = get_image_path_id(engine, file_name)
    labels = dumps(get_image_labels(engine, data_image["id"]))
    return templates.TemplateResponse(name='editor.html', context={'request': request,
                                                    'image_path': data_image["path"],
                                                    'image_labels': labels})

@images_router.post('/{file_name}/editor/save')
async def uploud_labels_editor(newBoxes: ImageBoxes):
    engine = conn()
    # Удаление из бд прошлых координат
    # Загрузка новых координат
    if delete_labels(newBoxes.image_name, engine):
        if uploud_labels_frontend(newBoxes.image_name, newBoxes, engine):
            return {
                "status": True,
                "description": "Новые данные загружены"
            }
        else:
            return {
                "status": False,
                "description": "Новые данные не загружены"
            }
    else:
        return {
            "status": False,
            "description": "Старые данные не удалены"
        }
