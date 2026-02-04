from fastapi import Request, APIRouter
from fastapi.templating import Jinja2Templates
from json import dumps
from v1.config.paths import APP_PATH, TEMPLATES_PATH, IMAGES_PATH, STYLE_PATH, JS_PATH
from v1.core.conn import conn
from v1.core.queries import get_image_path_id, get_image_labels

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
