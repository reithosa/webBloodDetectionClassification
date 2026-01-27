from fastapi import Request, APIRouter
from fastapi.templating import Jinja2Templates
from v1.config.paths import APP_PATH, TEMPLATES_PATH, IMAGES_PATH, STYLE_PATH, JS_PATH

images_router = APIRouter(prefix='/image', tags=['Frontend'])
templates = Jinja2Templates(directory=TEMPLATES_PATH)

@images_router.get('/')
async def get_image(request: Request):
    return templates.TemplateResponse(name='image.html', request={'request': request})