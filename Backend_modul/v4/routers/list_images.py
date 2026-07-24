from fastapi import APIRouter, Request, UploadFile
from fastapi.templating import Jinja2Templates
from v4.config.paths import UPLOADS_PATH, TEMPLATES_PATH
from v4.core.conn import conn
from v4.core.queries import images_panel, delete_image, count_of_pages


list_images_router = APIRouter(tags=['Frontend'])
templates = Jinja2Templates(directory=TEMPLATES_PATH)

def get_pagination_range(current: int, total: int, delta: int = 2) -> list:
    if total <= 1:
        return [1]
    
    pages = []
    pages.append(1)
    start = max(2, current - delta)
    end = min(total - 1, current + delta)
    
    if start > 2:
        pages.append(None)
    
    for p in range(start, end + 1):
        pages.append(p)

    if end < total - 1:
        pages.append(None)

    if total > 1:
        pages.append(total)

    return pages

@list_images_router.get('/images')
async def get_images_page(request: Request, page: int = 0):
    engine = conn()
    count_of_page = count_of_pages(engine=engine, count=8)
    pages = get_pagination_range(current=page, total=count_of_page, delta=2)
    return templates.TemplateResponse(name='images.html', 
                                      context={'request': request,
                                               'pagination_range': pages,
                                               'current_page': page,
                                               'max_pages': count_of_page})


@list_images_router.get('/images/get')
async def get_panels(request: Request, page: int = 0):
    engine = conn()
    panels = images_panel(engine=engine, count=8, page=page)
    return templates.TemplateResponse(name='panels.html', 
                                    context={'request': request,
                                        'panels': panels,})


@list_images_router.post('/{file_name}/delete')
async def remove_image(file_name: str):
    print("Delete activate")
    engine = conn()
    result = delete_image(file_name, engine)
    return result


