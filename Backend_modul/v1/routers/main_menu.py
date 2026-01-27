from fastapi import APIRouter, Request, UploadFile
from fastapi.templating import Jinja2Templates
from v1.config.paths import UPLOADS_PATH, TEMPLATES_PATH
from v1.core.conn import conn
from v1.core.queries import last_six_image, upload_image, upload_labels, get_last_image_indx
from v1.ml.analysys import search_cells

main_router = APIRouter(tags=['Frontend'])
templates = Jinja2Templates(directory=TEMPLATES_PATH)

def image_analysys(path, name, engine):
    try:
        print("=" * 100)
        print("image_analysys START")
        print("=" * 100)
        result = search_cells(path)
        print("=" * 100)
        print("image_analysys upload_labels")
        print("=" * 100)
        upload_labels(name, result, engine)
        print("=" * 100)
        print("image_analysys TRUE")
        print("=" * 100)
        return True
    except BaseException:
        print("=" * 100)
        print("image_analysys FALSE")
        print("=" * 100)
        return False

@main_router.get('/')
async def get_main_page(request: Request):
    engine = conn()
    images = last_six_image(engine)
    return templates.TemplateResponse(name='main_menu.html', 
                                      context={'request': request,
                                               "images": images})

@main_router.post('/image')
async def post_image(image: UploadFile): # async не буду делать, потому что может возникнуть проблема с индексами
    engine = conn()
    img = image.file
    img_type = (image.content_type).split('/')[1]
    indx = get_last_image_indx(engine)
    img_name = f'image{indx+1}.{img_type}'
    img_path = UPLOADS_PATH + f'\\{img_name}'
    upload_image(img_name, engine)
    with open(img_path, 'wb') as f:
        f.write(img.read())
    
    if image_analysys(img_path, img_name, engine):
        print("=" * 100)
        print("РЕЗУЛЬТАТ ПОЛОЖИТЕЛЬНЫЙ")
        print("=" * 100)
        return {"status": "true",
                "file_name": img_name}
    else:
        print("=" * 100)
        print("РЕЗУЛЬТАТ НЕГАТИВНЫЙ")
        print("=" * 100)
        return {"status": "false",
                "file_name": img_name}

